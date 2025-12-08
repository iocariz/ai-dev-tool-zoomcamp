/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivePlayer } from '../models/ActivePlayer';
import type { ApiResponse } from '../models/ApiResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GameService {
    /**
     * Get all active players
     * @returns any List of active players
     * @throws ApiError
     */
    public static getGamesActive(): CancelablePromise<(ApiResponse & {
        data?: Array<ActivePlayer>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/games/active',
        });
    }
    /**
     * Get active player by ID
     * @param id
     * @returns any Active player details
     * @throws ApiError
     */
    public static getGamesActive1(
        id: string,
    ): CancelablePromise<(ApiResponse & {
        data?: ActivePlayer;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/games/active/{id}',
            path: {
                'id': id,
            },
        });
    }
}
