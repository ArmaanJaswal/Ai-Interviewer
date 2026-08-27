import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";

const setupPassport = () => {
  // 1. Google OAuth Strategy
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret || googleClientId.includes("your-google-client-id")) {
    console.warn("Passport Google OAuth: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured in .env yet.");
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId || "dummy_google_client_id",
        clientSecret: googleClientSecret || "dummy_google_client_secret",
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase() : null;
          const name =
            profile.displayName ||
            (profile.name ? `${profile.name.givenName || ""} ${profile.name.familyName || ""}`.trim() : "Google User");
          const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

          if (!email) {
            return done(new Error("No email found in Google account profile"), null);
          }

          // Check if user exists by googleId
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Check if user exists by email
            user = await User.findOne({ email });

            if (user) {
              // Link googleId to existing user
              user.googleId = profile.id;
              if (avatar && !user.avatar) user.avatar = avatar;
              await user.save();
            } else {
              // Create new OAuth user
              user = await User.create({
                name,
                email,
                googleId: profile.id,
                avatar,
                role: "user",
                plan: "free",
                interviewsUsed: 0,
                interviewsAllowed: 1,
              });
            }
          }

          return done(null, user);
        } catch (err) {
          console.error("Error in GoogleStrategy verify callback:", err);
          return done(err, null);
        }
      }
    )
  );

  // 2. GitHub OAuth Strategy
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!githubClientId || !githubClientSecret || githubClientId.includes("your-github-client-id")) {
    console.warn("Passport GitHub OAuth: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is not configured in .env yet.");
  }

  passport.use(
    new GitHubStrategy(
      {
        clientID: githubClientId || "dummy_github_client_id",
        clientSecret: githubClientSecret || "dummy_github_client_secret",
        callbackURL: "/api/auth/github/callback",
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let email = null;
          if (profile.emails && profile.emails.length > 0) {
            email = profile.emails[0].value.toLowerCase();
          } else if (profile._json && profile._json.email) {
            email = profile._json.email.toLowerCase();
          } else {
            email = `${profile.username}@users.noreply.github.com`;
          }

          const name = profile.displayName || profile.username || "GitHub User";
          const avatar =
            (profile.photos && profile.photos[0] ? profile.photos[0].value : null) ||
            (profile._json ? profile._json.avatar_url : null);

          // Check if user exists by githubId
          let user = await User.findOne({ githubId: profile.id });

          if (!user) {
            // Check if user exists by email
            user = await User.findOne({ email });

            if (user) {
              // Link githubId to existing user
              user.githubId = profile.id;
              if (avatar && !user.avatar) user.avatar = avatar;
              await user.save();
            } else {
              // Create new OAuth user
              user = await User.create({
                name,
                email,
                githubId: profile.id,
                avatar,
                role: "user",
                plan: "free",
                interviewsUsed: 0,
                interviewsAllowed: 1,
              });
            }
          }

          return done(null, user);
        } catch (err) {
          console.error("Error in GitHubStrategy verify callback:", err);
          return done(err, null);
        }
      }
    )
  );
};

export default setupPassport;

