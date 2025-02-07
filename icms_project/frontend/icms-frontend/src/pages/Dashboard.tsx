import { useState, useEffect } from 'react';
import type { FC, ReactElement } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingBills: number;
  totalRevenue: number;
}

interface RecentAppointment {
  id: number;
  patientName: string;
  date: string;
  type: string;
}

interface RecentPatient {
  id: number;
  name: string;
  registeredDate: string;
  condition: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactElement;
  loading: boolean;
}

const Dashboard: FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingBills: 0,
    totalRevenue: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls
    const fetchData = async (): Promise<void> => {
      try {
        // In a real app, these would be API calls
        setStats({
          totalPatients: 150,
          todayAppointments: 12,
          pendingBills: 8,
          totalRevenue: 5240,
        });

        setRecentAppointments([
          { id: 1, patientName: 'John Doe', date: '2025-02-07T10:00:00', type: 'Check-up' },
          { id: 2, patientName: 'Jane Smith', date: '2025-02-07T11:30:00', type: 'Follow-up' },
          { id: 3, patientName: 'Mike Johnson', date: '2025-02-07T14:00:00', type: 'Consultation' },
        ]);

        setRecentPatients([
          { id: 1, name: 'Alice Brown', registeredDate: '2025-02-07', condition: 'Diabetes' },
          { id: 2, name: 'Bob Wilson', registeredDate: '2025-02-06', condition: 'Hypertension' },
          { id: 3, name: 'Carol White', registeredDate: '2025-02-05', condition: 'Asthma' },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, loading }: StatCardProps): ReactElement => (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        {icon}
      </Box>
      {loading ? (
        <Skeleton variant="text" width="60%" height={40} />
      ) : (
        <Typography variant="h4" component="div">
          {typeof value === 'number' && title.includes('Revenue')
            ? `$${value.toLocaleString()}`
            : value.toLocaleString()}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={<PeopleIcon color="primary" />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={<CalendarIcon color="primary" />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Bills"
            value={stats.pendingBills}
            icon={<ReceiptIcon color="error" />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={<MoneyIcon color="success" />}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Appointments
            </Typography>
            <List>
              {loading ? (
                [...Array<number>(3)].map((_, index) => (
                  <ListItem key={index} divider={index < 2}>
                    <ListItemAvatar>
                      <Skeleton variant="circular" width={40} height={40} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Skeleton variant="text" width="60%" />}
                      secondary={<Skeleton variant="text" width="40%" />}
                    />
                  </ListItem>
                ))
              ) : (
                recentAppointments.map((appointment: RecentAppointment, index) => (
                  <ListItem key={appointment.id} divider={index < recentAppointments.length - 1}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={appointment.patientName}
                      secondary={`${format(new Date(appointment.date), 'PPp')} - ${
                        appointment.type
                      }`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Patients
            </Typography>
            <List>
              {loading ? (
                [...Array<number>(3)].map((_, index) => (
                  <ListItem key={index} divider={index < 2}>
                    <ListItemAvatar>
                      <Skeleton variant="circular" width={40} height={40} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Skeleton variant="text" width="60%" />}
                      secondary={<Skeleton variant="text" width="40%" />}
                    />
                  </ListItem>
                ))
              ) : (
                recentPatients.map((patient: RecentPatient, index) => (
                  <ListItem key={patient.id} divider={index < recentPatients.length - 1}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={patient.name}
                      secondary={`Registered: ${format(
                        new Date(patient.registeredDate),
                        'PP'
                      )} - ${patient.condition}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
