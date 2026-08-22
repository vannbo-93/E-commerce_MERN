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
  const findUser = await userModel.findOne({ email });

  if (findUser) {
    return { statusCode: 409, data: { message: "User already exists!" } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new userModel({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });
  await newUser.save();

  return {
    statusCode: 201,
    data: {
      token: generateJWT({
        userId: newUser._id.toString(),
        firstName,
        lastName,
        email,
      }),
      user: { firstName, lastName, email },
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
  const findUser = await userModel.findOne({ email });

  if (!findUser) {
    return {
      statusCode: 401,
      data: { message: "Incorrect email or password!" },
    };
  }

  const passwordMatch = await bcrypt.compare(password, findUser.password);
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
