import {
  Catch,
  RpcExceptionFilter,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';

type ErrorMessage = {
  message: string[];
};

@Catch(BadRequestException)
export class ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost): Observable<any> {
    let errors = exception.getResponse();

    if (!(errors instanceof String)) {
      errors = (errors as ErrorMessage).message;
    }

    console.log(errors);

    return of({
      errors,
      status: false,
    });
  }
}
