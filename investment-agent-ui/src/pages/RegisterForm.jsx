import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Stack,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

export default function RegisterForm() {
  const { register, loading, clearAuthError } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const usernameError =
    touched && username.trim().length > 0 && username.trim().length < 3
      ? "Username must be at least 3 characters"
      : "";

  const passwordError =
    touched && password.length > 0 && password.length < 6
      ? "Password must be at least 6 characters"
      : "";

  const confirmError =
    touched && confirmPassword.length > 0 && confirmPassword !== password
      ? "Passwords don't match"
      : "";

  const canSubmit =
    username.trim().length >= 3 &&
    password.length >= 6 &&
    confirmPassword === password &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    clearAuthError();
    await register(username, password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        <Box>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched(true)}
            fullWidth
            autoFocus
            autoComplete="username"
            error={!!usernameError}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlined />
                  </InputAdornment>
                ),
              },
            }}
          />
          {usernameError && <FormHelperText error>{usernameError}</FormHelperText>}
        </Box>

        <Box>
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            fullWidth
            autoComplete="new-password"
            error={!!passwordError}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {passwordError && <FormHelperText error>{passwordError}</FormHelperText>}
        </Box>

        <Box>
          <TextField
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            fullWidth
            autoComplete="new-password"
            error={!!confirmError}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {confirmError && <FormHelperText error>{confirmError}</FormHelperText>}
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={!canSubmit}
          sx={{ py: 1.25, mt: 1 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : "Create account"}
        </Button>
      </Stack>
    </Box>
  );
}