import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import decode from 'jwt-decode';

import { AuthTokenError } from "../services/errors/AuthTokenError";
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
};

export function withSSRAuth<p>(fn: GetServerSideProps<p>, options?: WithSSRAuthOptions): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<p>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['@nextauth:token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    if (options) {
      const user = decode<{ permissions: string[], roles: string[] }>(token);
      const { permissions, roles } = options;
  
      const userHasValidatePermissions = validateUserPermissions({
        user,
        permissions,
        roles,
      });

      if (!userHasValidatePermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          }
        }
      }
    }

    try {
      return await fn(ctx)
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx , '@nextauth:token');
        destroyCookie(ctx, '@nextauth:refreshToken');
    
        return {
          redirect: {
            destination: '/',
            permanent: false,
          }
        }
      }
    }
  }
}