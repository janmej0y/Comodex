import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { LoginInput } from "./dto/login.input";
import { RefreshSessionInput } from "./dto/refresh-session.input";
import { SignupInput } from "./dto/signup.input";
import { AuthPayload } from "./models/auth-payload.model";
import { UserModel } from "./models/user.model";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserModel)
  signup(@Args("input") input: SignupInput) {
    return this.authService.signup(input);
  }

  @Mutation(() => AuthPayload)
  login(@Args("input") input: LoginInput) {
    return this.authService.login(input);
  }

  @Mutation(() => AuthPayload)
  refreshSession(@Args("input") input: RefreshSessionInput) {
    return this.authService.refreshSession(input);
  }

  @Mutation(() => Boolean)
  logout(@Args("refreshToken") refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}