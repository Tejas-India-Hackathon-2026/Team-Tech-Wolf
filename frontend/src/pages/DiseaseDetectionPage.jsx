import React, { useState, useEffect } from 'react';
import { 
  ScanSearch, 
  Upload, 
  AlertTriangle, 
  ShieldAlert, 
  Leaf, 
  RefreshCw, 
  CheckSquare, 
  Info,
  Sparkles,
  HelpCircle,
  FileCheck,
  XCircle,
  Clock,
  History,
  ShieldCheck,
  AlertCircle,
  Cpu,
  Layers
} from 'lucide-react';
import { diseaseService } from '../services/diseaseService';

const SUPPORTED_CROPS = ['Tomato', 'Potato', 'Rice', 'Wheat', 'Cotton', 'Corn'];
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];

// Curated crop-specific sample scenarios for realistic demonstration
const CROP_SAMPLE_SCENARIOS = {
  Tomato: [
    { id: 'tomato-early-blight', label: 'Early Blight Scenario', preview: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80' },
    { id: 'tomato-late-blight', label: 'Late Blight Scenario', preview: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&auto=format&fit=crop&q=80' },
    { id: 'tomato-healthy', label: 'Healthy Crop Scenario', preview: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80' }
  ],
  Potato: [
    { id: 'potato-early-blight', label: 'Early Blight Scenario', preview: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80' },
    { id: 'potato-late-blight', label: 'Late Blight Scenario', preview: 'https://images.unsplash.com/photo-1590165482129-1b8b27698980?w=600&auto=format&fit=crop&q=80' },
    { id: 'potato-healthy', label: 'Healthy Crop Scenario', preview: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80' }
  ],
  Rice: [
    { id: 'rice-leaf-blast', label: 'Leaf Blast Scenario', preview: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&auto=format&fit=crop&q=80' },
    { id: 'rice-brown-spot', label: 'Brown Spot Scenario', preview: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
    { id: 'rice-healthy', label: 'Healthy Paddy Scenario', preview: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80' }
  ],
  Wheat: [
    { id: 'wheat-leaf-rust', label: 'Leaf Rust (Stripe Rust)', preview: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80' },
    { id: 'wheat-powdery-mildew', label: 'Powdery Mildew Scenario', preview: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80' },
    { id: 'wheat-healthy', label: 'Healthy Wheat Scenario', preview: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=600&auto=format&fit=crop&q=80' }
  ],
  Cotton: [
    { id: 'cotton-bacterial-blight', label: 'Bacterial Blight / Black Arm', preview: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80' },
    { id: 'cotton-leaf-curl', label: 'Leaf Curl Virus Scenario', preview: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80' },
    { id: 'cotton-healthy', label: 'Healthy Cotton Scenario', preview: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=600&auto=format&fit=crop&q=80' }
  ],
  Corn: [
    { id: 'corn-common-rust', label: 'Common Rust Scenario', preview: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80' },
    { id: 'corn-leaf-blight', label: 'Northern Leaf Blight', preview: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
    { id: 'corn-healthy', label: 'Healthy Corn Scenario', preview: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&auto=format&fit=crop&q=80' }
  ]
};

const DiseaseDetectionPage = () => {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedScenarioId, setSelectedScenarioId] = useState('tomato-early-blight');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load initial history on mount
  useEffect(() => {
    diseaseService.getHistory().then((data) => {
      if (Array.isArray(data)) setHistoryList(data);
    });
  }, []);

  // Sync default scenario when crop changes
  const handleCropChange = (cropName) => {
    setSelectedCrop(cropName);
    const scenarios = CROP_SAMPLE_SCENARIOS[cropName] || [];
    const firstScenario = scenarios[0]?.id || null;
    setSelectedScenarioId(firstScenario);
    setDiagnosisResult(null);
    setErrorMessage(null);
    
    // If an uploaded file is not active, preview the first scenario sample
    if (!imageFile) {
      if (scenarios[0]) {
        setImagePreview(scenarios[0].preview);
        setFileDetails({
          name: `${cropName.toLowerCase()}_sample_leaf.jpg`,
          size: '1.2 MB',
          type: 'SAMPLE'
        });
      } else {
        setImagePreview(null);
        setFileDetails(null);
      }
    }
  };

  const handleImageChange = (e) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type || '';
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(fileExt);

    if (!ALLOWED_TYPES.includes(fileType) && !isAllowedExt) {
      setErrorMessage(`Unsupported file format (${fileType || fileExt || 'Unknown'}). Please upload a JPG, PNG, WEBP, or BMP image.`);
      return;
    }

    // Validate file size (10 MB limit)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setErrorMessage(`File is too large (${fileSizeMB.toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    if (file.size === 0) {
      setErrorMessage('Uploaded file is empty (0 bytes). Please select a valid photo.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFileDetails({
      name: file.name,
      size: `${fileSizeMB.toFixed(2)} MB`,
      type: fileExt?.toUpperCase() || 'IMAGE'
    });
    setDiagnosisResult(null);
  };

  const handleScenarioSelect = (scenario) => {
    setSelectedScenarioId(scenario.id);
    setErrorMessage(null);
    setImageFile(null);
    setImagePreview(scenario.preview);
    setFileDetails({
      name: `${scenario.id}.jpg`,
      size: '1.1 MB',
      type: 'SAMPLE'
    });
    setDiagnosisResult(null);
  };

  const runAnalysis = async () => {
    // 1. Mandatory Crop Selection Validation
    if (!selectedCrop || !selectedCrop.trim()) {
      setErrorMessage('Please select a crop before analysis.');
      return;
    }

    // 2. Mandatory Image Selection Validation
    if (!imagePreview && !imageFile) {
      setErrorMessage('Please upload a crop/leaf image.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      let payload;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('crop', selectedCrop);
        if (selectedScenarioId) {
          formData.append('scenario_id', selectedScenarioId);
        }
        payload = formData;
      } else {
        payload = {
          crop: selectedCrop,
          scenario_id: selectedScenarioId,
          filename: `${selectedCrop.toLowerCase()}_sample_leaf.jpg`
        };
      }

      const res = await diseaseService.analyze(payload);
      setDiagnosisResult(res);

      // Refresh history
      diseaseService.getHistory().then((data) => {
        if (Array.isArray(data)) setHistoryList(data);
      });

    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during disease analysis. Please check your connection and retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setImageFile(null);
    setImagePreview(null);
    setFileDetails(null);
    setDiagnosisResult(null);
    setErrorMessage(null);
  };

  const currentScenarios = CROP_SAMPLE_SCENARIOS[selectedCrop] || [];

  return (
    <div className="page-wrapper container">
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="badge-pill badge-emerald">
              <ScanSearch size={14} /> AI Diagnostic Module
            </span>
            <span className="badge-pill badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Cpu size={13} /> Demo Analysis
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
            onClick={() => setShowHistory(!showHistory)}
          >
            <History size={14} style={{ color: 'var(--primary-700)' }} />
            <span>{showHistory ? 'Hide Scan History' : `Scan History (${historyList.length})`}</span>
          </button>
        </div>

        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: 'var(--text-heading)' }}>
          Crop Pathology & Disease Detection
        </h1>
        
        {/* Prototype Demo Notice Banner */}
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fef3c7',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginTop: '0.75rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.6rem',
          fontSize: '0.85rem',
          color: '#92400e'
        }}>
          <Info size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Prototype demonstration — real AI disease model is not currently connected.</strong>
            <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '2px' }}>
              In demo mode, pathology analysis runs against verified crop disease reference scenarios. Arbitrary uploaded images cannot be validated by a vision model without a configured vision API key.
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Step Indicator */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem',
        background: '#ffffff',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-700)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>Select Crop</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: imagePreview ? 'var(--primary-700)' : 'var(--primary-100)', color: imagePreview ? '#ffffff' : 'var(--primary-800)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: imagePreview ? 'var(--text-heading)' : 'var(--text-muted)' }}>Upload / Pick Image</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: isAnalyzing ? 'var(--accent-amber)' : 'var(--primary-100)', color: isAnalyzing ? '#ffffff' : 'var(--primary-800)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isAnalyzing ? 'var(--accent-amber)' : 'var(--text-muted)' }}>Analyze Pathology</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: diagnosisResult ? 'var(--primary-700)' : 'var(--primary-100)', color: diagnosisResult ? '#ffffff' : 'var(--primary-800)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: diagnosisResult ? 'var(--primary-700)' : 'var(--text-muted)' }}>Actionable Advice</span>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          color: '#991b1b',
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} style={{ color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer' }}>
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* History Drawer */}
      {showHistory && (
        <div className="glass-card" style={{ marginBottom: '2rem', background: '#f8faf7', border: '1px solid var(--border-green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} style={{ color: 'var(--primary-700)' }} />
              Recent Field Diagnostic Logs
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Showing last {historyList.length} logs</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            {historyList.map((item, idx) => (
              <div 
                key={item.id || idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>{item.crop || item.crop_name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {typeof item.confidence === 'number' ? `${item.confidence}% AI` : 'Demo Scenario'}
                  </span>
                </div>
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-heading)', display: 'block', marginBottom: '0.25rem' }}>
                  {item.disease || item.detected_disease}
                </strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Severity: {item.severity} • {item.timestamp || 'Recorded'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Input Column vs Diagnosis Column */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: User Inputs */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-heading)' }}>
            <Leaf size={18} style={{ color: 'var(--primary-700)' }} />
            Step 1: Select Crop & Leaf Image
          </h3>

          {/* 1. Crop Selector */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>1. Target Crop Selection (Required)</label>
            <select 
              className="form-control" 
              value={selectedCrop} 
              onChange={(e) => handleCropChange(e.target.value)}
            >
              {SUPPORTED_CROPS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 2. Crop-Specific Sample Scenarios */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                {selectedCrop} Demo Scenarios:
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Select to preview</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {currentScenarios.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleScenarioSelect(sc)}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedScenarioId === sc.id && !imageFile ? 'var(--primary-100)' : '#ffffff',
                    color: selectedScenarioId === sc.id && !imageFile ? 'var(--primary-800)' : 'var(--text-muted)',
                    border: `1px solid ${selectedScenarioId === sc.id && !imageFile ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                    fontWeight: selectedScenarioId === sc.id && !imageFile ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Image Upload Box */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>2. Upload Leaf Photo</label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>JPG, PNG, WEBP (Max 10MB)</span>
            </div>

            <div 
              style={{
                border: '2px dashed #86efac',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem 1.25rem',
                textAlign: 'center',
                background: '#f0fdf4',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => document.getElementById('leaf-upload-input').click()}
            >
              <input 
                id="leaf-upload-input" 
                type="file" 
                accept="image/jpeg,image/png,image/webp,image/jpg,image/bmp" 
                style={{ display: 'none' }} 
                onChange={handleImageChange}
              />

              {imagePreview ? (
                <div style={{ width: '100%', position: 'relative' }}>
                  <img 
                    src={imagePreview} 
                    alt="Leaf Preview" 
                    style={{ 
                      maxHeight: '160px', 
                      maxWidth: '100%', 
                      borderRadius: 'var(--radius-sm)', 
                      objectFit: 'contain', 
                      margin: '0 auto', 
                      boxShadow: 'var(--shadow-sm)' 
                    }} 
                  />
                  {fileDetails && (
                    <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--primary-900)', background: 'var(--primary-100)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                      <FileCheck size={14} style={{ color: 'var(--primary-700)' }} />
                      <span>{fileDetails.name} ({fileDetails.size})</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--primary-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-700)',
                    marginBottom: '0.65rem'
                  }}>
                    <Upload size={20} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.2rem', color: 'var(--text-heading)' }}>
                    Click or Drag & Drop Leaf Photo
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Capture high-resolution leaf spots or foliar lesions
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.85rem 1.25rem' }}
              onClick={runAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={16} className="animate-pulse" />
                  <span>Analyzing {selectedCrop} Pathology...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analyze {selectedCrop} Crop</span>
                </>
              )}
            </button>

            {imagePreview && (
              <button
                className="btn btn-secondary"
                onClick={resetUpload}
                title="Clear Image"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Pathology Diagnostic Results */}
        <div>
          {isAnalyzing && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.25rem auto',
                borderRadius: '50%',
                background: 'var(--primary-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-700)'
              }}>
                <ScanSearch size={32} className="animate-pulse" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
                Evaluating {selectedCrop} Pathology...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                Comparing foliar patterns, lesion concentricity, chlorotic margins, and regional treatment guidelines...
              </p>
            </div>
          )}

          {!isAnalyzing && !diagnosisResult && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.25rem auto',
                borderRadius: '50%',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)'
              }}>
                <Info size={30} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
                Ready to Analyze Crop
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
                Select a crop from the dropdown, choose a demo scenario or upload a leaf photo, and click <strong>"Analyze Crop"</strong>.
              </p>

              {/* Supported Crops Guide */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                  Supported Crops in Pathology Database:
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {SUPPORTED_CROPS.map((c) => (
                    <span key={c} className="badge-pill badge-emerald" style={{ fontSize: '0.72rem' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isAnalyzing && diagnosisResult && (
            <div className="glass-card" style={{ border: '1px solid var(--primary-200)' }}>
              
              {/* Diagnosis Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span className="badge-pill badge-emerald">Crop: {diagnosisResult.crop}</span>
                    <span className={`badge-pill ${
                      diagnosisResult.severity === 'Severe' || diagnosisResult.severity === 'Critical' 
                        ? 'badge-red' 
                        : diagnosisResult.severity === 'Moderate' 
                        ? 'badge-amber' 
                        : 'badge-emerald'
                    }`}>
                      Severity: {diagnosisResult.severity}
                    </span>
                    {diagnosisResult.is_demo !== false && (
                      <span className="badge-pill badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Cpu size={12} /> {diagnosisResult.mode_label || 'Demo Analysis'}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                    {diagnosisResult.is_demo !== false ? 'Demo Disease Scenario:' : 'Detected Disease:'}
                  </div>
                  <h2 style={{ fontSize: '1.65rem', color: 'var(--text-heading)', lineHeight: '1.25', margin: '0.2rem 0' }}>
                    {diagnosisResult.disease}
                  </h2>
                  {diagnosisResult.scientific_name && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                      Scientific Pathogen: {diagnosisResult.scientific_name}
                    </div>
                  )}
                </div>

                {/* Honest Confidence Display */}
                <div style={{ textAlign: 'right' }}>
                  {typeof diagnosisResult.confidence === 'number' && !diagnosisResult.is_demo ? (
                    <>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
                        {diagnosisResult.confidence}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>AI Vision Confidence</div>
                    </>
                  ) : (
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
                        Demo Scenario
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#b45309' }}>
                        Model confidence unavailable in demo mode.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hindi / Regional Farmer Advisory */}
              {diagnosisResult.regional_explanation && (
                <div style={{ marginBottom: '1.25rem', background: '#fefce8', border: '1px solid #fef08a', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <HelpCircle size={15} /> किसान सलाह (Farmer Advisory in Hindi):
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#854d0e', lineHeight: '1.5', fontWeight: 500, margin: 0 }}>
                    "{diagnosisResult.regional_explanation}"
                  </p>
                </div>
              )}

              {/* Common Signs / Symptoms */}
              {diagnosisResult.symptoms && diagnosisResult.symptoms.length > 0 && (
                <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
                    <AlertTriangle size={15} style={{ color: 'var(--accent-amber)' }} />
                    Common Signs & Diagnostic Indicators:
                  </strong>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                    {diagnosisResult.symptoms.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Next Actions / Advice */}
              {diagnosisResult.advice && diagnosisResult.advice.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    <CheckSquare size={16} style={{ color: 'var(--primary-700)' }} />
                    Suggested Next Actions & Field Advice:
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {diagnosisResult.advice.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: '#f0fdf4', border: '1px solid var(--border-green)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          background: 'var(--primary-700)', 
                          color: '#ffffff', 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ color: 'var(--primary-900)', fontSize: '0.86rem', lineHeight: '1.4' }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prevention Guidance */}
              {diagnosisResult.prevention && diagnosisResult.prevention.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <ShieldAlert size={16} style={{ color: 'var(--accent-gold)' }} />
                    Prevention Guidance:
                  </strong>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                    {diagnosisResult.prevention.map((prev, idx) => (
                      <li key={idx}>{prev}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explicit Mandatory Disclaimers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{
                  background: '#f8faf7',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <ShieldCheck size={18} style={{ color: 'var(--primary-700)', flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    <strong>Disclaimer:</strong> AI provides preliminary decision support only — not a guaranteed diagnosis. Consult agricultural experts for confirmation.
                  </span>
                </div>

                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid var(--border-green)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.82rem',
                  color: 'var(--primary-900)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <Layers size={18} style={{ color: 'var(--primary-700)', flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    <strong>Demo result</strong> — connect a trained crop-disease vision model for real image-based classification.
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetectionPage;
