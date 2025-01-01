import React, { useMemo } from 'react';
import { AttendanceSession } from '../../types';
import { LineChart } from '@mui/x-charts';
import { ThemeProvider, createTheme } from '@mui/material';

interface Props {
  sessions: AttendanceSession[];
}

type DataPoint = {
  date: Date;
  attendance: number;
};

const flattenSessions = (sessions: AttendanceSession[]): DataPoint[] => {
  return sessions.map((session, _) => {
    return {
      date: session.expires,
      attendance: session.attendees.length,
    };
  });
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return month + '/' + day + '/' + year;
};

export const SessionPlot: React.FC<Props> = ({ sessions }) => {
  const dataPoints = useMemo(() => flattenSessions(sessions), [sessions]);

  // Must use Material UI's theme provider to use their components
  return (
    <ThemeProvider theme={createTheme()}>
      <LineChart
        xAxis={[
          {
            dataKey: 'date',
            valueFormatter: (value) => formatDate(new Date(value)),
          },
        ]}
        series={[
          {
            dataKey: 'attendance',
          },
        ]}
        dataset={dataPoints}
        width={800}
        height={400}
      />
    </ThemeProvider>
  );
};
