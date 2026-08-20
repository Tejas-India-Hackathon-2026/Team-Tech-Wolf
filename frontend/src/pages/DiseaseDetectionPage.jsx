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
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { diseaseService } from '../services/diseaseService';

const SUPPORTED_CROPS = ['Tomato', 'Potato', 'Rice', 'Wheat', 'Cotton', 'Corn'];
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];

// Curated crop sample previews for interactive one-click testing
const SAMPLE_PREVIEWS = {
  Tomato: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80',
  Potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
  Rice: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&auto=format&fit=crop&q=80',
  Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  Cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80',
  Corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80'
};

const DiseaseDetectionPage = () => {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    diseaseService.getHistory().then((data) => {
      if (Array.isArray(data)) setHistoryList(data);
    });
  }, []);

  const handleImageChange = (e) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage(`Unsupported file format (${file.type || 'Unknown'}). Please upload a JPG, PNG, or WEBP image.`);
      return;
    }

    // Validate file size (10 MB limit)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setErrorMessage(`File is too large (${fileSizeMB.toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFileDetails({
      name: file.name,
      size: `${fileSizeMB.toFixed(2)} MB`,
      type: file.type.split('/')[1]?.toUpperCase() || 'IMAGE'
    });
    setDiagnosisResult(null);
  };

  const handleSampleClick = (cropName) => {
    setSelectedCrop(cropName);
    setErrorMessage(null);
    setImageFile(null);
    setImagePreview(SAMPLE_PREVIEWS[cropName] || SAMPLE_PREVIEWS.Tomato);
    setFileDetails({
      name: `${cropName.toLowerCase()}_field_sample.jpg`,
      size: '1.2 MB',
      type: 'SAMPLE'
    });
    setDiagnosisResult(null);
  };

  const runAnalysis = async () => {
    if (!imagePreview && !imageFile) {
      setErrorMessage('Please upload a leaf photo or pick a sample crop image first.');
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
        payload = formData;
      } else {
        payload = {
          crop: selectedCrop,
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

  return (
    <div className="page-wrapper container">
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge-pill badge-emerald">
              <ScanSearch size={14} /> AI Diagnostic Pillar
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Computer Vision & Pathology Engine</span>
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

        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
          AI Crop Disease Detection
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px' }}>
          Follow the 4-step workflow: <strong>Upload Leaf Image → AI Analyzes → Get Actionable Advice → Receive Treatment Protocols</strong>.
        </p>
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
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)' }}>Select Crop & Image</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: isAnalyzing ? 'var(--accent-amber)' : 'var(--primary-100)', color: isAnalyzing ? '#ffffff' : 'var(--primary-800)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isAnalyzing ? 'var(--accent-amber)' : 'var(--text-muted)' }}>AI Analyzes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: diagnosisResult ? 'var(--primary-700)' : 'var(--primary-100)', color: diagnosisResult ? '#ffffff' : 'var(--primary-800)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: diagnosisResult ? 'var(--primary-700)' : 'var(--text-muted)' }}>Get Advice</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: diagnosisResult ? 'var(--primary-700)' : 'var(--primary-100)', color: diagnosisResult ? '#ffffff' : 'var(--primary-800)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: diagnosisResult ? 'var(--primary-700)' : 'var(--text-muted)' }}>Receive Results</span>
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
          <button onClick={() => setErrorMessage(null)} style={{ color: '#991b1b' }}>
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
              Recent Field Diagnosis History (Supabase Log)
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Showing last {historyList.length} scans</span>
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-700)' }}>{item.confidence}%</span>
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

      {/* Main Grid: Upload Column vs Results Column */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: User Inputs */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-heading)' }}>
            <Leaf size={18} style={{ color: 'var(--primary-700)' }} />
            Step 1: Select Crop & Upload Leaf Photo
          </h3>

          {/* 1. Crop Selector */}
          <div className="form-group">
            <label className="form-label">1. Select Target Crop</label>
            <select 
              className="form-control" 
              value={selectedCrop} 
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setDiagnosisResult(null);
              }}
            >
              {SUPPORTED_CROPS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 2. Image Upload Box */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="form-label" style={{ margin: 0 }}>2. Upload Leaf / Plant Photo</label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Max 10MB (JPG, PNG, WEBP)</span>
            </div>

            <div 
              style={{
                border: '2px dashed #86efac',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem 1.5rem',
                textAlign: 'center',
                background: '#f0fdf4',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: '210px',
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
                accept="image/jpeg,image/png,image/webp,image/jpg" 
                style={{ display: 'none' }} 
                onChange={handleImageChange}
              />

              {imagePreview ? (
                <div style={{ width: '100%', position: 'relative' }}>
                  <img 
                    src={imagePreview} 
                    alt="Leaf Preview" 
                    style={{ 
                      maxHeight: '170px', 
                      maxWidth: '100%', 
                      borderRadius: 'var(--radius-sm)', 
                      objectFit: 'contain', 
                      margin: '0 auto', 
                      boxShadow: 'var(--shadow-sm)' 
                    }} 
                  />
                  {fileDetails && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--primary-900)', background: 'var(--primary-100)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
                      <FileCheck size={14} style={{ color: 'var(--primary-700)' }} />
                      <span>{fileDetails.name} ({fileDetails.size})</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--primary-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-700)',
                    marginBottom: '0.75rem'
                  }}>
                    <Upload size={22} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--text-heading)' }}>
                    Click or Drag & Drop Leaf Photo
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Capture high-resolution leaf spots or foliar lesions
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Demo Sample Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
              Or quick-test with verified field crop samples:
            </div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {SUPPORTED_CROPS.map((cp) => (
                <button
                  key={cp}
                  type="button"
                  onClick={() => handleSampleClick(cp)}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedCrop === cp && !imageFile ? 'var(--primary-100)' : '#ffffff',
                    color: selectedCrop === cp && !imageFile ? 'var(--primary-800)' : 'var(--text-muted)',
                    border: `1px solid ${selectedCrop === cp && !imageFile ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                    fontWeight: selectedCrop === cp && !imageFile ? 700 : 500
                  }}
                >
                  {cp} Sample
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.85rem 1.25rem' }}
              onClick={runAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={16} className="animate-pulse" />
                  <span>Analyzing Pathology...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analyze Crop</span>
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

        {/* Right Column: AI Analysis Results */}
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
                Pathology Model Analyzing {selectedCrop} Leaf...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                Evaluating lesion concentricity, chlorotic borders, fungal mycelium structures, and severity rating...
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
                No Crop Analyzed Yet
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
                Select your crop type, upload or pick a leaf image from the left panel, and click <strong>"Analyze Crop"</strong> to receive real-time diagnosis and recommendations.
              </p>

              {/* Supported Crops Quick Guide */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                  Supported Crops in Pathology Model:
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
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge-pill badge-emerald">Crop: {diagnosisResult.crop}</span>
                    <span className={`badge-pill ${
                      diagnosisResult.severity === 'Severe' || diagnosisResult.severity === 'Critical' 
                        ? 'badge-red' 
                        : diagnosisResult.severity === 'Moderate' 
                        ? 'badge-amber' 
                        : 'badge-emerald'
                    }`}>
                      Risk / Severity: {diagnosisResult.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                    Detected Disease:
                  </div>
                  <h2 style={{ fontSize: '1.65rem', color: 'var(--text-heading)', lineHeight: '1.25' }}>
                    {diagnosisResult.disease}
                  </h2>
                  {diagnosisResult.scientific_name && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '2px' }}>
                      Scientific Pathogen: {diagnosisResult.scientific_name}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
                    {diagnosisResult.confidence}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Confidence Level</div>
                </div>
              </div>

              {/* Hindi / Regional Explanation Box */}
              {diagnosisResult.regional_explanation && (
                <div style={{ marginBottom: '1.25rem', background: '#fefce8', border: '1px solid #fef08a', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <HelpCircle size={15} /> किसान सलाह (Farmer Advisory in Hindi):
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#854d0e', lineHeight: '1.5', fontWeight: 500 }}>
                    "{diagnosisResult.regional_explanation}"
                  </p>
                </div>
              )}

              {/* Symptoms Observed */}
              {diagnosisResult.symptoms && diagnosisResult.symptoms.length > 0 && (
                <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
                    <AlertTriangle size={15} style={{ color: 'var(--accent-amber)' }} />
                    Symptoms & Diagnostic Indicators:
                  </strong>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {diagnosisResult.symptoms.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Advice List */}
              {diagnosisResult.advice && diagnosisResult.advice.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    <CheckSquare size={16} style={{ color: 'var(--primary-700)' }} />
                    Actionable Field Advice:
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

              {/* Prevention Tips List */}
              {diagnosisResult.prevention && diagnosisResult.prevention.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <ShieldAlert size={16} style={{ color: 'var(--accent-gold)' }} />
                    Long-Term Prevention Tips:
                  </strong>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.86rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {diagnosisResult.prevention.map((prev, idx) => (
                      <li key={idx}>{prev}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mandatory Safety Disclaimer */}
              <div style={{
                background: '#f8faf7',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                fontSize: '0.82rem',
                color: 'var(--text-dim)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary-700)', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Safety Disclaimer:</strong> AI provides preliminary decision support only — not a guaranteed diagnosis. Consult agricultural experts for confirmation.
                </span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetectionPage;
