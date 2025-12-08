/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Login user
     * @param requestBody
     * @returns any Successful login
     * @throws ApiError
     */
    public static postAuthLogin(
        requestBody: {
            email: string;
            password: string;
        },
    ): CancelablePromise<(ApiResponse & {
        data?: User;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Register new user
     * @param requestBody
     * @returns any Successful registration
     * @throws ApiError
     */
    public static postAuthSignup(
        requestBody: {
            username: string;
            email: string;
            password: string;
        },
    ): CancelablePromise<(ApiResponse & {
        data?: User;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Logout user
     * @returns any Successful logout
     * @throws ApiError
     */
    public static postAuthLogout(): CancelablePromise<(ApiResponse & {
        data?: any;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
        });
    }
    /**
     * Get current user
     * @returns any Current user session
     * @throws ApiError
     */
    public static getAuthMe(): CancelablePromise<(ApiResponse & {
        data?: User;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/me',
        });
    }
}
