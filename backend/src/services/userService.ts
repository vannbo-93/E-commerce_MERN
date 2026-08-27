/** @format */
import bcrypt from "bcrypt";
import { userModel } from "../models/userModel.js";
import jwt from "jsonwebtoken";

interface ServiceResult<T> {
  statusCode: number;
  data: T;
}

interface JWTPayload {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

type ValidationResult =
  | { valid: false; message: string }
  | {
      valid: true;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    };

const validateUserInput = ({
  firstName,
  lastName,
  email,
  password,
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}): ValidationResult => {
  const cleanedFirstName = firstName?.trim();
  const cleanedLastName = lastName?.trim();
  const cleanedPassword = password?.trim();
  const cleanedEmail = normalizeEmail(email ?? "");

  if (!cleanedFirstName || !cleanedLastName) {
    return { valid: false, message: "First name and last name are required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
    return { valid: false, message: "A valid email is required." };
  }

  if (!cleanedPassword || cleanedPassword.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long." };
  }

  return {
    valid: true,
    firstName: cleanedFirstName,
    lastName: cleanedLastName,
    email: cleanedEmail,
    password: cleanedPassword,
  };
};

const generateJWT = ({
  userId,
  firstName,
  lastName,
  email,
}: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");

  return jwt.sign({ userId, firstName, lastName, email }, secret, {
    expiresIn: "7d",
  });
};

interface RegisterParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const register = async ({
  firstName,
  lastName,
  email,
  password,
}: RegisterParams): Promise<ServiceResult<any>> => {
  const validation = validateUserInput({ firstName, lastName, email, password });

  if (!validation.valid) {
    return {
      statusCode: 400,
      data: { message: validation.message },
    };
  }

  const normalizedEmail = validation.email;
  const normalizedFirstName = validation.firstName;
  const normalizedLastName = validation.lastName;
  const normalizedPassword = validation.password;

  const findUser = await userModel.findOne({ email: normalizedEmail } as any);

  if (findUser) {
    return { statusCode: 409, data: { message: "User already exists!" } };
  }

  const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
  const newUser = new userModel({
    email: normalizedEmail,
    password: hashedPassword,
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
  });
  await newUser.save();

  return {
    statusCode: 201,
    data: {
      token: generateJWT({
        userId: newUser._id.toString(),
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        email: normalizedEmail,
      }),
      user: {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        email: normalizedEmail,
      },
    },
  };
};

interface LoginParams {
  email: string;
  password: string;
}

export const login = async ({
  email,
  password,
}: LoginParams): Promise<ServiceResult<any>> => {
  const normalizedEmail = normalizeEmail(email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      statusCode: 400,
      data: { message: "A valid email is required." },
    };
  }

  const findUser = await userModel.findOne({ email: normalizedEmail } as any);

  if (!findUser) {
    return {
      statusCode: 401,
      data: { message: "Incorrect email or password!" },
    };
  }

  const passwordMatch = await bcrypt.compare(password.trim(), findUser.password);
  if (passwordMatch) {
    return {
      statusCode: 200,
      data: {
        token: generateJWT({
          userId: findUser._id.toString(),
          email: findUser.email,
          firstName: findUser.firstName,
          lastName: findUser.lastName,
        }),
        user: {
          firstName: findUser.firstName,
          lastName: findUser.lastName,
          email: findUser.email,
        },
      },
    };
  }

  return { statusCode: 401, data: { message: "Incorrect email or password!" } };
};
