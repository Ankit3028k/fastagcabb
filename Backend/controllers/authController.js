import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../Models/user.js';
import Redis from 'ioredis';
import asyncRetry from 'async-retry';
import sanitize from 'sanitize-html';

// Redis Configuration with fallback
let redis;
try {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  });
} catch (error) {
  console.warn('Redis connection failed, using in-memory storage:', error.message);
  redis = null;
}

// In-memory storage fallback
const memoryStorage = new Map();

// Infobip Configuration
const INFOBIP_CONFIG = {
  baseURL: process.env.INFOBIP_BASE_URL || 'https://ypqwxp.api.infobip.com',
  apiKey: process.env.INFOBIP_API_KEY
};

// OTP Helper Functions
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const storeOTP = async (phoneNumber, otp) => {
  const key = `otp:${phoneNumber}`;
  try {
    if (redis) {
      await redis.set(key, otp, 'EX', 15 * 60); // 15 minutes expiry
    } else {
      // Fallback to in-memory storage
      const expiresAt = Date.now() + (15 * 60 * 1000);
      memoryStorage.set(key, { otp, expiresAt });

      // Auto cleanup after expiry
      setTimeout(() => {
        memoryStorage.delete(key);
      }, 15 * 60 * 1000);
    }
  } catch (error) {
    console.error('Error storing OTP:', error);
    // Fallback to in-memory storage
    const expiresAt = Date.now() + (15 * 60 * 1000);
    memoryStorage.set(key, { otp, expiresAt });
  }
};

const verifyStoredOTP = async (phoneNumber, enteredOTP) => {
  const key = `otp:${phoneNumber}`;
  console.log('🔍 Verifying OTP for phone:', phoneNumber);
  console.log('🔍 Storage key:', key);
  console.log('🔍 Entered OTP:', enteredOTP);

  try {
    let storedOTP = null;

    if (redis) {
      storedOTP = await redis.get(key);
      console.log('🔍 Redis stored OTP:', storedOTP);
    } else {
      // Check in-memory storage
      const stored = memoryStorage.get(key);
      console.log('🔍 Memory storage check:', stored);
      if (stored && Date.now() < stored.expiresAt) {
        storedOTP = stored.otp;
        console.log('🔍 Valid stored OTP found:', storedOTP);
      } else if (stored) {
        console.log('🔍 Expired OTP found, cleaning up');
        memoryStorage.delete(key); // Clean up expired OTP
      } else {
        console.log('🔍 No OTP found in memory storage');
      }
    }

    if (!storedOTP) {
      return { success: false, message: 'OTP not found or expired' };
    }

    if (storedOTP === enteredOTP) {
      // Remove OTP after successful verification
      if (redis) {
        await redis.del(key);
      } else {
        memoryStorage.delete(key);
      }
      return { success: true, message: 'OTP verified successfully' };
    }

    return { success: false, message: 'Invalid OTP' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Error verifying OTP' };
  }
};

const sendSMSViaInfobip = async (phoneNumber, message) => {
  try {
    const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
    const smsData = {
      messages: [
        {
          from: 'FASTAGCAB',
          destinations: [{ to: formattedPhone }],
          text: message
        }
      ]
    };

    const response = await asyncRetry(
      async () => {
        const res = await fetch(`${INFOBIP_CONFIG.baseURL}/sms/2/text/advanced`, {
          method: 'POST',
          headers: {
            'Authorization': `App ${INFOBIP_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(smsData)
        });
        return res;
      },
      { retries: 3, minTimeout: 1000, factor: 2 }
    );

    const responseData = await response.json();
    if (response.ok && responseData.messages && responseData.messages[0].status.groupId === 1) {
      return {
        success: true,
        messageId: responseData.messages[0].messageId,
        to: formattedPhone
      };
    } else {
      const errorMessage =
        responseData.messages?.[0]?.status?.description ||
        responseData.requestError?.serviceException?.text ||
        'Failed to send SMS';
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, message: 'Network error while sending SMS' };
  }
};

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const {
      fullName,
      phoneNumber,
      password,
      dateOfBirth,
      age,
      adharNumber,
      panCardNumber,
      pinCode,
      state,
      city,
      address,
      dealerCode,
      role
    } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      fullName: sanitize(fullName),
      phoneNumber: sanitize(phoneNumber),
      password,
      dateOfBirth: new Date(sanitize(dateOfBirth)),
      age: parseInt(sanitize(age)),
      adharNumber: adharNumber ? sanitize(adharNumber) : undefined,
      panCardNumber: panCardNumber ? sanitize(panCardNumber) : undefined,
      pinCode: sanitize(pinCode),
      state: sanitize(state),
      city: sanitize(city),
      address: sanitize(address),
      dealerCode: sanitize(dealerCode).toUpperCase(),
      role: sanitize(role || 'Electrician')
    };

    // Check if user exists
    const existingUser = await asyncRetry(
      async () => await User.findOne({ phoneNumber: sanitizedData.phoneNumber }).maxTimeMS(15000),
      { retries: 3, minTimeout: 1000, factor: 2 }
    );

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Validate file uploads
    if (!req.files || !req.files.profilePhoto) {
      return res.status(400).json({ success: false, message: 'Profile photo is required' });
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (const fileType of ['profilePhoto', 'adharCard', 'panCard', 'bankDetails']) {
      if (req.files[fileType] && !allowedTypes.includes(req.files[fileType][0].mimetype)) {
        return res.status(400).json({ success: false, message: `${fileType} must be JPEG or PNG` });
      }
      if (req.files[fileType] && req.files[fileType][0].size > maxSize) {
        return res.status(400).json({ success: false, message: `${fileType} size exceeds 5MB` });
      }
    }

    // Prepare user data
    const userData = {
      ...sanitizedData,
      profilePhoto: req.files.profilePhoto[0].path,
      adharCard: req.files.adharCard ? req.files.adharCard[0].path : undefined,
      panCard: req.files.panCard ? req.files.panCard[0].path : undefined,
      bankDetails: req.files.bankDetails ? req.files.bankDetails[0].path : undefined
    };

    // Hash password
    userData.password = await bcrypt.hash(password, 10);

    // Create user with transaction
    const session = await User.startSession();
    try {
      await session.withTransaction(async () => {
        const user = await User.create([userData], { session });
        return user[0];
      });
      const user = await User.findOne({ phoneNumber: sanitizedData.phoneNumber });
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            status: user.status,
            isVerified: user.isVerified
          },
          token
        }
      });
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Register error:', error);
    if (error.message.includes('timeout')) {
      return res.status(503).json({ success: false, message: 'Database timeout' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { phoneNumber, password } = req.body;
    const sanitizedPhone = sanitize(phoneNumber);

    const user = await asyncRetry(
      async () => await User.findOne({ phoneNumber: sanitizedPhone }).select('+password').maxTimeMS(15000),
      { retries: 3, minTimeout: 1000, factor: 2 }
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          status: user.status,
          isVerified: user.isVerified,
          dealerCode: user.dealerCode,
          address: user.address,
          age: user.age,
          dateOfBirth: user.dateOfBirth,
          pinCode: user.pinCode,
          state: user.state,
          city: user.city,
          adharNumber: user.adharNumber,
          panCardNumber: user.panCardNumber,
          profilePhoto: user.profilePhoto,
          adharCard: user.adharCard,
          panCard: user.panCard,
          bankDetails: user.bankDetails,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

export const logout = async (_req, res) => {
  res.status(200).json({ success: true, message: 'Logout successful' });
};

export const verifyToken = async (req, res) => {
  try {
    // The authenticateToken middleware already verified the token and set req.user
    const user = req.user;

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        _id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        address: user.address,
        age: user.age,
        dateOfBirth: user.dateOfBirth,
        profilePhoto: user.profilePhoto,
        adharCard: user.adharCard,
        panCard: user.panCard,
        bankDetails: user.bankDetails,
        status: user.status,
        isVerified: user.isVerified,
        dealerCode: user.dealerCode
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { phoneNumber } = req.body;
    const sanitizedPhone = sanitize(phoneNumber);

    // Rate limiting (skip if Redis not available)
    if (redis) {
      const rateLimitKey = `otp:rate:${sanitizedPhone}`;
      try {
        const attempts = await redis.get(rateLimitKey);
        if (attempts && parseInt(attempts) >= 5) {
          return res.status(429).json({ success: false, message: 'Too many OTP requests. Try again later.' });
        }
      } catch (redisError) {
        console.warn('Redis rate limit check failed:', redisError.message);
      }
    }

    const otp = generateOTP();
    await storeOTP(sanitizedPhone, otp);
    const message = `Your FASTAGCAB verification code is ${otp}. Valid for 15 minutes. Do not share this code.`;
    // Send OTP via Infobip or other service
    // For now, just store the OTP and return success
    console.log('📱 Generated OTP for testing:', otp);

    // Update rate limit (skip if Redis not available)
    if (redis) {
      try {
        const rateLimitKey = `otp:rate:${sanitizedPhone}`;
        await redis.incr(rateLimitKey);
        await redis.expire(rateLimitKey, 24 * 60 * 60); // 24 hours expiry
      } catch (redisError) {
        console.warn('Redis rate limit update failed:', redisError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        to: sanitizedPhone,
        // Include test OTP in development mode only
        ...(process.env.NODE_ENV !== 'production' && { testOtp: otp })
      }
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { phoneNumber, otp } = req.body;
    const verificationResult = await verifyStoredOTP(sanitize(phoneNumber), sanitize(otp));

    res.status(verificationResult.success ? 200 : 400).json(verificationResult);
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { phoneNumber } = req.body;
    const sanitizedPhone = sanitize(phoneNumber);

    // Rate limiting
    const rateLimitKey = `otp:rate:${sanitizedPhone}`;
    const attempts = await redis.get(rateLimitKey);
    if (attempts && parseInt(attempts) >= 5) {
      return res.status(429).json({ success: false, message: 'Too many OTP requests. Try again later.' });
    }

    const otp = generateOTP();
    await storeOTP(sanitizedPhone, otp);
    const message = `Your FASTAGCAB verification code is ${otp}. Valid for 15 minutes. Do not share this code.`;

    // Send OTP via Infobip or other service
    // For now, just store the OTP and return success
    console.log('📱 Generated OTP for testing (resend):', otp);

    await redis.incr(rateLimitKey);
    await redis.expire(rateLimitKey, 24 * 60 * 60);
    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        to: sanitizedPhone,
        // Include test OTP in development mode only
        ...(process.env.NODE_ENV !== 'production' && { testOtp: otp })
      }
      });
    } else {
      res.status(500).json({ success: false, message: smsResult.message });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error while resending OTP' });
  }
};