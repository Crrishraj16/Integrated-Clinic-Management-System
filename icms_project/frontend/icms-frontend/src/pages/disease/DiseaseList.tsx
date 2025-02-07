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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { diseaseAPI } from '../../services/api';
import { Disease } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';

const categories = [
  'All',
  'Infectious',
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Neurological',
  'Musculoskeletal',
  'Endocrine',
  'Mental Health',
  'Other',
];

const DiseaseList: React.FC = () => {
  const navigate = useNavigate();
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDiseases, setTotalDiseases] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const response = await diseaseAPI.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
        category: category === 'All' ? undefined : category,
        symptoms,
      });
      setDiseases(response.data.data);
      setTotalDiseases(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch diseases. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, [page, rowsPerPage, searchQuery, category, symptoms]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddDisease = () => {
    navigate('/disease/new');
  };

  const handleEditDisease = (disease: Disease) => {
    navigate(`/disease/${disease.id}/edit`);
  };

  const handleViewDisease = (disease: Disease) => {
    navigate(`/disease/${disease.id}`);
  };

  const handleDeleteClick = (disease: Disease) => {
    setSelectedDisease(disease);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDisease?.id) return;

    try {
      await diseaseAPI.delete(selectedDisease.id);
      fetchDiseases();
      setDeleteDialogOpen(false);
      setSelectedDisease(null);
    } catch (err) {
      setError('Failed to delete disease. Please try again later.');
    }
  };

  const handleSymptomSearch = (value: string) => {
    const symptomList = value.split(',').map((s) => s.trim()).filter(Boolean);
    setSymptoms(symptomList);
    setPage(0);
  };

  if (loading && diseases.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Disease Database
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDisease}
        >
          Add Disease
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search diseases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by symptoms (comma-separated)"
              onChange={(e) => handleSymptomSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
        </Grid>

        {error && (
          <Box mt={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <TableContainer sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Common Symptoms</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diseases.map((disease) => (
                <TableRow key={disease.id}>
                  <TableCell>{disease.name}</TableCell>
                  <TableCell>{disease.category}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {disease.symptoms.slice(0, 3).map((symptom: string, index: number) => (
                        <Chip
                          key={index}
                          label={symptom}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {disease.symptoms.length > 3 && (
                        <Chip
                          label={`+${disease.symptoms.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={disease.risk_level}
                      color={
                        disease.risk_level === 'High'
                          ? 'error'
                          : disease.risk_level === 'Medium'
                          ? 'warning'
                          : 'success'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewDisease(disease)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditDisease(disease)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteClick(disease)}>
                        <DeleteIcon />
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
          count={totalDiseases}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this disease? This action cannot be undone.
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

export default DiseaseList;
