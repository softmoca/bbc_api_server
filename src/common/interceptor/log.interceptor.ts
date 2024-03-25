import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map, tap } from "rxjs";

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> {
    const now = new Date();
    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;

    console.log(`[REQ] ${path} ${now.toLocaleString("kr")}`);
    console.log(now.getMilliseconds());

    return next
      .handle()
      .pipe(
        tap((observable) =>
          console.log(
            `[RES] ${path} ${new Date().toLocaleString("kr")} ${new Date().getMilliseconds() - now.getMilliseconds()}ms`,
            new Date().getMilliseconds()
          )
        )
      );
  }
}
