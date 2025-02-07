import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  LocalHospital as MedicationIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { Disease, Medication } from '../../types';
import { diseaseAPI, medicationAPI } from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';

const DiseaseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [disease, setDisease] = useState<Disease | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [diseaseResponse, medicationsResponse] = await Promise.all([
          diseaseAPI.getById(parseInt(id)),
          medicationAPI.getAll(),
        ]);

        setDisease(diseaseResponse.data);
        setMedications(medicationsResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch disease details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = () => {
    if (id) {
      navigate(`/disease/${id}/edit`);
    }
  };

  const handleBack = () => {
    navigate('/disease');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !disease) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Disease not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  const getRecommendedMedications = () => {
    return medications.filter((med) =>
      disease.recommended_medications?.includes(med.id)
    );
  };

  const getContraindicatedMedications = () => {
    return medications.filter((med) =>
      disease.contraindicated_medications?.includes(med.id)
    );
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back
        </Button>
        <Typography variant="h4" component="h1" flex={1}>
          {disease.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">{disease.category}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Risk Level
                </Typography>
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
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">{disease.description}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Symptoms
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {disease.symptoms.map((symptom, index) => (
                <Chip
                  key={index}
                  label={symptom}
                  variant="outlined"
                  icon={<InfoIcon />}
                />
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Complications
            </Typography>
            <List>
              {disease.complications.map((complication, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={complication} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preventive Measures
            </Typography>
            <List>
              {disease.preventive_measures.map((measure, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={measure} />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Medication Guidelines
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Recommended Medications
            </Typography>
            <List>
              {getRecommendedMedications().map((medication) => (
                <ListItem key={medication.id}>
                  <ListItemIcon>
                    <MedicationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={medication.name}
                    secondary={medication.description}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Contraindicated Medications
            </Typography>
            <List>
              {getContraindicatedMedications().map((medication) => (
                <ListItem key={medication.id}>
                  <ListItemIcon>
                    <BlockIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={medication.name}
                    secondary={medication.description}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {disease.notes && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Notes
              </Typography>
              <Typography variant="body1">{disease.notes}</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DiseaseDetails;
