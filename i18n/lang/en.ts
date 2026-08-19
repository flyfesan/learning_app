import type { UIStrings } from '../types';

export default {
  nav: {
    home: 'Home',
    translate: 'Translate',
    about: 'About Us',
    search: 'Search',
    signin: 'Sign In',
    signup: 'Sign Up',
  },
  pagination: {
    prev: 'Prev',
    next: 'Next',
    page: 'Page',
  },
  home: {
    socialLinks: 'Social Links',
    featured: 'Featured',
    recentPosts: 'Recent Posts',
    allPosts: 'All Posts',
  },
  footer: {
    copyright: 'Copyright',
    allRightsReserved: 'All rights reserved.',
  },
  pages: {
    tagTitle: 'Tag',
    tagDesc: 'All the articles with the tag',

    tagsTitle: 'Tags',
    tagsDesc: 'All the tags used in posts.',

    translateTitle: 'Translate anything',
    translateDesc: 'Translate any text into your language.',

    postsTitle: 'Posts',
    postsDesc: "All the articles I've posted.",

    archivesTitle: 'Archives',
    archivesDesc: "All the articles I've archived.",

    searchTitle: 'Search',
    searchDesc: 'Search any article ...',

    signupTitle: 'Sign Up',
  },
  notFound: {
    title: '404 Not Found',
    message: 'Page Not Found',
    goHome: 'Go back home',
  },
  action: {
    translate: 'Translate',

  },
  auth: {
    signinTitlePage: 'Sign In',
    signinDescPage: 'Login with your Apple or Google account',
    signupTitlePage: 'Sign Up',
    signupDescPage: 'Create your account to get started',
    passwordResetTitlePage: 'Reset Password',
    passwordResetDescPage: 'Enter your email to reset your password',
    action: {
      login: 'Login',
      register: 'Register',
      googleSignin: 'Login with Google',
      appleSignin: 'Login with Apple',
      googleSignup: 'Sign up with Google',
      appleSignup: 'Sign up with Apple',
    },
    labels: {
      email: 'Email',
      password: 'Password',
      passwordConfirm: 'Confirm Password',
    },
    continueWith: 'Or continue with',
    passwordHint: 'Must be at least 8 characters long.',
    passwordReset: 'Reset Password',
    passwordResetSuccess: 'Password reset successful',
    forgotPassword: 'Forgot Password?',
    noAccount: 'Don\'t have an account?',
    haveAccount: 'Already have an account?',
  },
} satisfies UIStrings;
