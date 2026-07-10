import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const { login, loading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    await login(username, password);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          autoFocus
          autoComplete="username"
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
       <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          autoComplete="current-password"
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
                    size="small"
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
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading || !username.trim() || !password}
          sx={{ py: 1.25, mt: 1 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : "Sign in"}
        </Button>
      </Stack>
    </Box>
  );
}
