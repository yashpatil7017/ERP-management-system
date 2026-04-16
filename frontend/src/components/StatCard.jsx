import React from 'react';
import { Card, CardContent, Stack, Typography, Box } from '@mui/material';

export default function StatCard({ title, value, icon, color }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        color: 'common.white',
        background: color,
        boxShadow: '0 12px 26px rgba(15, 23, 42, 0.16)',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 18px 34px rgba(15, 23, 42, 0.22)',
        },
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            aria-hidden
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.22)',
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ display: 'block', lineHeight: 1.2, opacity: 0.95, fontWeight: 800, letterSpacing: '0.08em' }}
            >
              {title}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25, fontWeight: 900, letterSpacing: '-0.02em' }} noWrap>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

