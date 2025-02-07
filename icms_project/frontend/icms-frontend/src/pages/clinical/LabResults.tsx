import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { LabOrder } from '../../types';
import { labAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

interface TestResult {
  testId: number;
  value: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
  notes: string;
  status: 'completed' | 'pending' | 'cancelled';
}

const LabResults: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labOrder, setLabOrder] = useState<LabOrder | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  useEffect(() => {
    const fetchLabOrder = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await labAPI.getById(parseInt(id));
        setLabOrder(response.data);
        
        // Initialize test results
        const initialResults = response.data.tests.map((test: any, index: number) => ({
          testId: index,
          value: test.result?.value || '',
          unit: test.result?.unit || '',
          referenceRange: test.result?.referenceRange || '',
          interpretation: test.result?.interpretation || '',
          notes: test.result?.notes || '',
          status: test.status || 'pending',
        }));
        setTestResults(initialResults);
        setError(null);
      } catch (err) {
        setError('Failed to fetch lab order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLabOrder();
  }, [id]);

  const handleResultChange = (testId: number, field: keyof TestResult, value: string) => {
    setTestResults((prev) =>
      prev.map((result) =>
        result.testId === testId ? { ...result, [field]: value } : result
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !labOrder) return;

    try {
      setLoading(true);
      const updatedTests = labOrder.tests.map((test: { testId: number; test?: LabTest; result?: string; status: 'pending' | 'completed' | 'cancelled' }, index: number) => ({
        ...test,
        result: {
          value: testResults[index].value,
          unit: testResults[index].unit,
          referenceRange: testResults[index].referenceRange,
          interpretation: testResults[index].interpretation,
          notes: testResults[index].notes,
        },
        status: testResults[index].status,
      }));

      await labAPI.updateResults(parseInt(id), { tests: updatedTests });
      navigate('/clinical/lab');
    } catch (err) {
      setError('Failed to update test results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !labOrder) {
    return <LoadingScreen />;
  }

  if (!labOrder) {
    return (
      <Box p={3}>
        <Alert severity="error">Lab order not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Update Lab Results
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box mb={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Patient
              </Typography>
              <Typography variant="body1">Patient Name</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Doctor
              </Typography>
              <Typography variant="body1">Doctor Name</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Date
              </Typography>
              <Typography variant="body1">
                {new Date(labOrder.date).toLocaleDateString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {labOrder.tests.map((test, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {test.name}
                    </Typography>
                    {test.instructions && (
                      <Typography color="textSecondary" gutterBottom>
                        Instructions: {test.instructions}
                      </Typography>
                    )}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Result Value"
                          value={testResults[index].value}
                          onChange={(e) =>
                            handleResultChange(index, 'value', e.target.value)
                          }
                          disabled={testResults[index].status === 'cancelled'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Unit"
                          value={testResults[index].unit}
                          onChange={(e) =>
                            handleResultChange(index, 'unit', e.target.value)
                          }
                          disabled={testResults[index].status === 'cancelled'}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Reference Range"
                          value={testResults[index].referenceRange}
                          onChange={(e) =>
                            handleResultChange(index, 'referenceRange', e.target.value)
                          }
                          disabled={testResults[index].status === 'cancelled'}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Interpretation"
                          value={testResults[index].interpretation}
                          onChange={(e) =>
                            handleResultChange(index, 'interpretation', e.target.value)
                          }
                          multiline
                          rows={2}
                          disabled={testResults[index].status === 'cancelled'}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Notes"
                          value={testResults[index].notes}
                          onChange={(e) =>
                            handleResultChange(index, 'notes', e.target.value)
                          }
                          multiline
                          rows={2}
                          disabled={testResults[index].status === 'cancelled'}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={testResults[index].status}
                            onChange={(e) =>
                              handleResultChange(
                                index,
                                'status',
                                e.target.value as 'completed' | 'pending' | 'cancelled'
                              )
                            }
                            label="Status"
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/clinical/lab')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Update Results
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default LabResults;
