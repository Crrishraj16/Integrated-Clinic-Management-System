import { ReactNode, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
  ListItemButton,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
  Receipt as ReceiptIcon,
  LocalHospital as LocalHospitalIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Inventory as InventoryIcon,
  BugReport as BugReportIcon,
  Chat as ChatIcon,
  Healing as HealingIcon,
  Notifications as NotificationsIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

interface MainLayoutProps {
  children: ReactNode;
}

interface NavItem {
  title: string;
  icon: JSX.Element;
  path?: string;
  children?: NavItem[];
}

interface NavItemProps {
  item: NavItem;
  depth?: number;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  {
    title: 'Patient Management',
    icon: <PeopleIcon />,
    children: [
      { title: 'Patients List', icon: <PeopleIcon />, path: '/patients' },
      { title: 'Registration', icon: <PersonIcon />, path: '/patients/register' },
      { title: 'Insurance', icon: <SecurityIcon />, path: '/patients/insurance' },
    ],
  },
  {
    title: 'Appointments',
    icon: <CalendarTodayIcon />,
    children: [
      { title: 'All Appointments', icon: <CalendarTodayIcon />, path: '/appointments' },
      { title: 'Waiting List', icon: <PeopleIcon />, path: '/appointments/waiting' },
      { title: 'Resource Allocation', icon: <AssessmentIcon />, path: '/appointments/resources' },
    ],
  },
  {
    title: 'Clinical',
    icon: <LocalHospitalIcon />,
    children: [
      { title: 'Lab Orders', icon: <BugReportIcon />, path: '/clinical/lab' },
      { title: 'Prescriptions', icon: <ReceiptIcon />, path: '/clinical/prescriptions' },
      { title: 'Vaccinations', icon: <HealingIcon />, path: '/clinical/vaccinations' },
    ],
  },
  {
    title: 'Billing',
    icon: <ReceiptIcon />,
    children: [
      { title: 'Invoices', icon: <ReceiptIcon />, path: '/billing/invoices' },
      { title: 'Insurance Claims', icon: <SecurityIcon />, path: '/billing/claims' },
      { title: 'Payments', icon: <ReceiptIcon />, path: '/billing/payments' },
    ],
  },
  { title: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { title: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { title: 'Disease Database', icon: <BugReportIcon />, path: '/diseases' },
  { title: 'Chat Assistant', icon: <ChatIcon />, path: '/chat' },
  { title: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { title: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleItemClick = (path: string | undefined) => {
    if (path) {
      navigate(path);
    }
  };

  const handleExpandClick = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderNavItem = ({ item, depth = 0 }: NavItemProps) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = location.pathname === item.path;

    return (
      <Box key={item.title}>
        <ListItemButton
          onClick={() => {
            if (hasChildren) {
              handleExpandClick(item.title);
            } else {
              handleItemClick(item.path);
            }
          }}
          sx={{
            pl: depth * 3 + 2,
            backgroundColor: isActive ? 'action.selected' : 'transparent',
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.title} />
          {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderNavItem({ item: child, depth: depth + 1 }))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: open ? `${drawerWidth}px` : 0,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            ICMS - Integrated Clinic Management System
          </Typography>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => navigate('/profile')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => navigate('/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar />
        <Divider />
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List>
            {navItems.map((item) => renderNavItem({ item }))}
          </List>
        </Box>
        <Divider />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${open ? drawerWidth : 0}px)`,
          ml: `${open ? drawerWidth : 0}px`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
