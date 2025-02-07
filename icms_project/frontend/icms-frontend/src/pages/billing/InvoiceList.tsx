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
  Print as PrintIcon,
  MoreVert as MoreVertIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { billingAPI } from '../../services/api';
import { Invoice } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoiceForMenu, setSelectedInvoiceForMenu] = useState<Invoice | null>(
    null
  );

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getInvoices({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
      });
      setInvoices(response.data.data);
      setTotalInvoices(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, rowsPerPage, searchQuery]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddInvoice = () => {
    navigate('/billing/invoices/new');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    navigate(`/billing/invoices/${invoice.id}/edit`);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/billing/invoices/${invoice.id}`);
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvoice?.id) return;

    try {
      await billingAPI.deleteInvoice(selectedInvoice.id);
      fetchInvoices();
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
    } catch (err) {
      setError('Failed to delete invoice. Please try again later.');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, invoice: Invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoiceForMenu(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvoiceForMenu(null);
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      await billingAPI.printInvoice(invoice.id);
    } catch (err) {
      setError('Failed to print invoice. Please try again later.');
    }
    handleMenuClose();
  };

  const handleExportPDF = async (invoice: Invoice) => {
    try {
      await billingAPI.exportInvoicePDF(invoice.id);
    } catch (err) {
      setError('Failed to export invoice to PDF. Please try again later.');
    }
    handleMenuClose();
  };

  const handleEmailInvoice = async (invoice: Invoice) => {
    try {
      await billingAPI.emailInvoice(invoice.id);
    } catch (err) {
      setError('Failed to email invoice. Please try again later.');
    }
    handleMenuClose();
  };

  const handleRecordPayment = (invoice: Invoice) => {
    navigate(`/billing/invoices/${invoice.id}/payment`);
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'primary';
    }
  };

  if (loading && invoices.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Invoices
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddInvoice}
        >
          New Invoice
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search invoices..."
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
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.patient.full_name}</TableCell>
                  <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {invoice.due_date
                      ? new Date(invoice.due_date).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewInvoice(invoice)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleEditInvoice(invoice)}
                        disabled={invoice.status === 'paid'}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More Actions">
                      <IconButton onClick={(e) => handleMenuOpen(e, invoice)}>
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
          count={totalInvoices}
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
        <MenuItem
          onClick={() =>
            selectedInvoiceForMenu && handlePrintInvoice(selectedInvoiceForMenu)
          }
        >
          <PrintIcon sx={{ mr: 1 }} /> Print Invoice
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedInvoiceForMenu && handleExportPDF(selectedInvoiceForMenu)
          }
        >
          <PdfIcon sx={{ mr: 1 }} /> Export as PDF
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedInvoiceForMenu && handleEmailInvoice(selectedInvoiceForMenu)
          }
        >
          <EmailIcon sx={{ mr: 1 }} /> Email Invoice
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedInvoiceForMenu && handleRecordPayment(selectedInvoiceForMenu)
          }
          disabled={selectedInvoiceForMenu?.status === 'paid'}
        >
          <PaymentIcon sx={{ mr: 1 }} /> Record Payment
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedInvoiceForMenu && handleDeleteClick(selectedInvoiceForMenu)
          }
          disabled={selectedInvoiceForMenu?.status === 'paid'}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete Invoice
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this invoice? This action cannot be undone.
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

export default InvoiceList;
