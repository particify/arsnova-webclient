import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, switchMap } from 'rxjs';

export const CHALLENGE_URL = '/api/challenge';

export interface Challenge {
  algorithm: string;
  challenge: string;
  maxnumber: number;
  salt: string;
  signature: string;
}

export interface Solution {
  number: number;
  took: number;
  worker?: boolean;
}

interface TokenResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private http = inject(HttpClient);

  authenticateByChallenge(): Observable<string | undefined> {
    return this.fetchChallenge().pipe(
      switchMap((challenge) =>
        this.solveChallenge(challenge).pipe(
          map((solution) => ({ challenge, solution }))
        )
      ),
      switchMap(({ challenge, solution }) =>
        solution ? this.verifySolution(challenge, solution) : of(undefined)
      ),
      map((r) => r?.token)
    );
  }

  private solveChallenge(challenge: Challenge): Observable<Solution | null> {
    const handler = this.solveChallengeOnWorkers(
      challenge,
      navigator.hardwareConcurrency
    );
    return from(handler.promise);
  }

  private fetchChallenge(): Observable<Challenge> {
    return this.http.get<Challenge>(CHALLENGE_URL);
  }

  private verifySolution(
    challenge: Challenge,
    solution: Solution
  ): Observable<TokenResponse> {
    const payload = this.createPayload(challenge, solution);
    return this.http.post<TokenResponse>(CHALLENGE_URL, {
      solution: payload,
    });
  }

  private createPayload(challenge: Challenge, solution: Solution): string {
    return btoa(
      JSON.stringify({
        algorithm: challenge.algorithm,
        challenge: challenge.challenge,
        number: solution.number,
        salt: challenge.salt,
        signature: challenge.signature,
        took: solution.took,
      })
    );
  }

  /* This method has been adopted from Altcha.
   * Original copyright (c) 2023 Daniel Regeci, BAU Software s.r.o.
   * Original file: https://github.com/altcha-org/altcha/blob/e0e191cd3f1b1ee295704f9d34c0c4a752ca21a3/src/Altcha.svelte
   * License: MIT (https://github.com/altcha-org/altcha/blob/e0e191cd3f1b1ee295704f9d34c0c4a752ca21a3/LICENSE.txt)
   */
  private solveChallengeOnWorkers(
    challenge: Challenge,
    concurrency: number
  ): { promise: Promise<Solution | null>; controller: AbortController } {
    const max = challenge.maxnumber;
    const controller = new AbortController();
    const workersInstances: Worker[] = [];
    for (let i = 0; i < concurrency; i++) {
      workersInstances.push(this.createWorker());
    }
    const step = Math.ceil(max / concurrency);
    const fn = async () => {
      const solutions = await Promise.all(
        workersInstances.map((worker, i) => {
          const start = i * step;
          controller.signal.addEventListener('abort', () => {
            worker.postMessage({ type: 'abort' });
          });
          return new Promise((resolve) => {
            worker.addEventListener('message', (message: MessageEvent) => {
              if (message.data) {
                for (const w of workersInstances) {
                  if (w !== worker) {
                    w.postMessage({ type: 'abort' });
                  }
                }
              }
              resolve(message.data);
            });
            worker.postMessage({
              payload: challenge,
              max: start + step,
              start,
              type: 'work',
            });
          }) as Promise<Solution | null>;
        })
      );
      for (const worker of workersInstances) {
        worker.terminate();
      }
      return solutions.find((solution) => !!solution) || null;
    };
    return {
      promise: fn(),
      controller,
    };
  }

  private createWorker(): Worker {
    return new Worker(new URL('../../challenge-worker.ts', import.meta.url));
  }
}
