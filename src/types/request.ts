import express from 'express';

export interface HttpRequest<T> extends express.Request {
  requestParams: T;
}

export interface RequestWithUser<T> extends HttpRequest<T> {
  user: {
    userId: string,
  };
}
