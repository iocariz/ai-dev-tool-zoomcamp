/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { GameMode } from '../models/GameMode';
import type { LeaderboardEntry } from '../models/LeaderboardEntry';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LeaderboardService {
    /**
     * Get leaderboard entries
     * @param mode
     * @returns any List of leaderboard entries
     * @throws ApiError
     */
    public static getLeaderboard(
        mode?: GameMode,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<LeaderboardEntry>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/leaderboard',
            query: {
                'mode': mode,
            },
        });
    }
    /**
     * Submit a new score
     * @param requestBody
     * @returns any Score submitted
     * @throws ApiError
     */
    public static postLeaderboard(
        requestBody: {
            score: number;
            mode: GameMode;
            username?: string;
        },
    ): CancelablePromise<(ApiResponse & {
        data?: LeaderboardEntry;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/leaderboard',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
