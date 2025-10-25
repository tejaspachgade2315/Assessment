interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}
declare namespace Express {
  export interface Request {
    user?: JwtPayload;
  }
}
