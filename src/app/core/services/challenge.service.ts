import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ChallengeSolved } from '@app/core/models/events/challenge-solved';
import { EventService } from '@app/core/services/util/event.service';
import { Challenge, Solution, solveChallengeWorkers } from 'altcha/lib';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';

export const CHALLENGE_URL = '/api/challenge';

interface TokenResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private http = inject(HttpClient);
  private eventService = inject(EventService);

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
    const start = Date.now();
    const handler = solveChallengeWorkers({
      challenge,
      concurrency: navigator.hardwareConcurrency,
      createWorker: () => this.createWorker(),
    });
    return from(handler).pipe(
      tap(() => this.sendSolvedEvent(challenge.parameters.cost, start))
    );
  }

  private sendSolvedEvent(iterations: number, start: number) {
    const event = new ChallengeSolved(iterations, Date.now() - start);
    this.eventService.broadcast(event.type, event.payload);
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
        challenge: {
          parameters: challenge.parameters,
          signature: challenge.signature,
        },
        solution,
      })
    );
  }

  private createWorker(): Worker {
    return new Worker(new URL('../../challenge-worker.ts', import.meta.url));
  }
}
