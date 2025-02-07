import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { claimsAPI } from '../../services/api';
import { InsuranceClaim } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const ClaimsList: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalClaims, setTotalClaims] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClaimForMenu, setSelectedClaimForMenu] = useState<InsuranceClaim | null>(
    null
  );

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await claimsAPI.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      setClaims(response.data.data);
      setTotalClaims(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch insurance claims. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [page, rowsPerPage, searchQuery]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddClaim = () => {
    navigate('/billing/claims/new');
  };

  const handleEditClaim = (claim: InsuranceClaim) => {
    navigate(`/billing/claims/${claim.id}/edit`);
  };

  const handleViewClaim = (claim: InsuranceClaim) => {
    navigate(`/billing/claims/${claim.id}`);
  };

  const handleDeleteClick = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClaim?.id) return;

    try {
      await claimsAPI.delete(selectedClaim.id);
      fetchClaims();
      setDeleteDialogOpen(false);
      setSelectedClaim(null);
    } catch (err) {
      setError('Failed to delete claim. Please try again later.');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, claim: InsuranceClaim) => {
    setAnchorEl(event.currentTarget);
    setSelectedClaimForMenu(claim);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClaimForMenu(null);
  };

  const handleSubmitClaim = async (claim: InsuranceClaim) => {
    try {
      await claimsAPI.submit(claim.id);
      fetchClaims();
    } catch (err) {
      setError('Failed to submit claim. Please try again later.');
    }
    handleMenuClose();
  };

  const handleCheckStatus = async (claim: InsuranceClaim) => {
    try {
      await claimsAPI.checkStatus(claim.id);
      fetchClaims();
    } catch (err) {
      setError('Failed to check claim status. Please try again later.');
    }
    handleMenuClose();
  };

  const handleRecordPayment = (claim: InsuranceClaim) => {
    navigate(`/billing/claims/${claim.id}/payment`);
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'submitted':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && claims.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Insurance Claims
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClaim}
        >
          New Claim
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>

        {error && (
          <Box p={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Claim #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Insurance Provider</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.claim_number}</TableCell>
                  <TableCell>{new Date(claim.date).toLocaleDateString()}</TableCell>
                  <TableCell>{claim.patient.full_name}</TableCell>
                  <TableCell>{claim.insurance_provider}</TableCell>
                  <TableCell>${claim.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={claim.status}
                      color={getStatusColor(claim.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewClaim(claim)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleEditClaim(claim)}
                        disabled={claim.status !== 'draft'}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More Actions">
                      <IconButton onClick={(e) => handleMenuOpen(e, claim)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalClaims}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {selectedClaimForMenu?.status === 'draft' && (
          <MenuItem
            onClick={() =>
              selectedClaimForMenu && handleSubmitClaim(selectedClaimForMenu)
            }
          >
            <SendIcon sx={{ mr: 1 }} /> Submit Claim
          </MenuItem>
        )}
        {selectedClaimForMenu?.status === 'submitted' && (
          <MenuItem
            onClick={() =>
              selectedClaimForMenu && handleCheckStatus(selectedClaimForMenu)
            }
          >
            <RefreshIcon sx={{ mr: 1 }} /> Check Status
          </MenuItem>
        )}
        {selectedClaimForMenu?.status === 'approved' && (
          <MenuItem
            onClick={() =>
              selectedClaimForMenu && handleRecordPayment(selectedClaimForMenu)
            }
          >
            <MoneyIcon sx={{ mr: 1 }} /> Record Payment
          </MenuItem>
        )}
        {selectedClaimForMenu?.status === 'draft' && (
          <MenuItem
            onClick={() =>
              selectedClaimForMenu && handleDeleteClick(selectedClaimForMenu)
            }
          >
            <DeleteIcon sx={{ mr: 1 }} /> Delete Claim
          </MenuItem>
        )}
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this claim? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimsList;
