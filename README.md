# Express Challenge 7

## DEMO

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/wIZpiltL97o/0.jpg)](https://www.youtube.com/watch?v=wIZpiltL97o)


## Usage

#### Registration
```bash
  GET /signup
```
#### Login
```bash
  GET /signin
```
#### Profile
```bash
  GET /profile
```
#### Forgot Password
```bash
  GET /profile/email-verify
```
#### Reset Password
```bash
    GET /update-password-verify?token=
```

## install bun

```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

## How to run
To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

This project was created using `bun init` in bun v1.1.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.