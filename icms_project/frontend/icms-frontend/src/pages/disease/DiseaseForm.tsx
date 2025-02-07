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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Divider,
} from '@mui/material';
import { Disease, Medication } from '../../types';
import { diseaseAPI, medicationAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

const categories = [
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

const riskLevels = ['Low', 'Medium', 'High'];

const DiseaseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);

  const [diseaseData, setDiseaseData] = useState<Partial<Disease>>({
    name: '',
    description: '',
    category: '',
    symptoms: [],
    risk_level: 'Low',
    complications: [],
    preventive_measures: [],
    recommended_medications: [],
    contraindicated_medications: [],
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch medications for recommendations
        const medicationsResponse = await medicationAPI.getAll();
        setMedications(medicationsResponse.data);

        // If editing, fetch disease details
        if (isEdit && id) {
          const diseaseResponse = await diseaseAPI.getById(parseInt(id));
          setDiseaseData(diseaseResponse.data);
        }

        setError(null);
      } catch (err) {
        setError('Failed to load required data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!diseaseData.name || !diseaseData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      if (isEdit && id) {
        await diseaseAPI.update(parseInt(id), diseaseData);
      } else {
        await diseaseAPI.create(diseaseData);
      }
      navigate('/disease');
    } catch (err) {
      setError('Failed to save disease. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayFieldChange = (
    field: keyof Disease,
    value: string,
    operation: 'add' | 'remove'
  ) => {
    setDiseaseData((prev) => {
      const currentArray = prev[field] as string[];
      if (operation === 'add' && value && !currentArray.includes(value)) {
        return {
          ...prev,
          [field]: [...currentArray, value],
        };
      } else if (operation === 'remove') {
        return {
          ...prev,
          [field]: currentArray.filter((item) => item !== value),
        };
      }
      return prev;
    });
  };

  if (loading && !diseaseData) {
    return <LoadingScreen />;
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Edit Disease' : 'New Disease'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Disease Name"
                value={diseaseData.name || ''}
                onChange={(e) =>
                  setDiseaseData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={diseaseData.category || ''}
                  onChange={(e) =>
                    setDiseaseData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={diseaseData.description || ''}
                onChange={(e) =>
                  setDiseaseData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>Symptoms & Risk Assessment</Divider>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={diseaseData.symptoms || []}
                onChange={(_, newValue) =>
                  setDiseaseData((prev) => ({
                    ...prev,
                    symptoms: newValue,
                  }))
                }
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Symptoms"
                    placeholder="Add symptoms"
                    helperText="Press Enter to add symptoms"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={diseaseData.risk_level || 'Low'}
                  onChange={(e) =>
                    setDiseaseData((prev) => ({
                      ...prev,
                      risk_level: e.target.value,
                    }))
                  }
                  label="Risk Level"
                >
                  {riskLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={diseaseData.complications || []}
                onChange={(_, newValue) =>
                  setDiseaseData((prev) => ({
                    ...prev,
                    complications: newValue,
                  }))
                }
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Complications"
                    placeholder="Add potential complications"
                    helperText="Press Enter to add complications"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>Treatment & Prevention</Divider>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={diseaseData.preventive_measures || []}
                onChange={(_, newValue) =>
                  setDiseaseData((prev) => ({
                    ...prev,
                    preventive_measures: newValue,
                  }))
                }
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Preventive Measures"
                    placeholder="Add preventive measures"
                    helperText="Press Enter to add measures"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={medications}
                getOptionLabel={(option) => option.name}
                value={medications.filter((med) =>
                  diseaseData.recommended_medications?.includes(med.id)
                )}
                onChange={(_, newValue) =>
                  setDiseaseData((prev) => ({
                    ...prev,
                    recommended_medications: newValue.map((med) => med.id),
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Recommended Medications"
                    placeholder="Select medications"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={medications}
                getOptionLabel={(option) => option.name}
                value={medications.filter((med) =>
                  diseaseData.contraindicated_medications?.includes(med.id)
                )}
                onChange={(_, newValue) =>
                  setDiseaseData((prev) => ({
                    ...prev,
                    contraindicated_medications: newValue.map((med) => med.id),
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Contraindicated Medications"
                    placeholder="Select medications"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                value={diseaseData.notes || ''}
                onChange={(e) =>
                  setDiseaseData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/disease')}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {isEdit ? 'Update' : 'Create'} Disease
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default DiseaseForm;
