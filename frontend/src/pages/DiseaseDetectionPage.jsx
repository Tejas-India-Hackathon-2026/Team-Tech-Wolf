import React, { useState } from 'react';
import { 
  ScanSearch, 
  Upload, 
  AlertTriangle, 
  ShieldAlert, 
  Leaf, 
  FlaskConical, 
  RefreshCw, 
  CheckSquare, 
  Info,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { diseaseService } from '../services/diseaseService';

const SAMPLE_CROPS = ['Tomato', 'Wheat', 'Potato', 'Rice (Paddy)', 'Cotton', 'Corn'];

const DiseaseDetectionPage = () => {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setDiagnosisResult(null);
    }
  };

  const handleSampleClick = (cropName) => {
    setSelectedCrop(cropName);
    setImagePreview(`https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80`);
    setImageFile(null);
    setDiagnosisResult(null);
  };

  const runDiagnosis = async () => {
    setIsAnalyzing(true);
    try {
      let payload;
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        fd.append('crop', selectedCrop);
        payload = fd;
      } else {
        payload = { crop: selectedCrop, filename: `${selectedCrop.toLowerCase()}_sample_leaf.jpg` };
      }

      const res = await diseaseService.diagnose(payload);
      setDiagnosisResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setImagePreview(null);
    setImageFile(null);
    setDiagnosisResult(null);
  };

  return (
    <div className="page-wrapper container">
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span className="badge-pill badge-emerald">
            <ScanSearch size={14} /> Service 1 of 4
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Computer Vision Diagnostic Engine</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>AI Crop Disease Detection</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px' }}>
          Upload a clear photo of an infected leaf. Our neural pathology model analyzes lesions, discoloration patterns, and chlorosis to return instant diagnosis with dual chemical and organic treatment protocols.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Upload & Configuration Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-heading)' }}>
            <Leaf size={18} style={{ color: 'var(--primary-700)' }} />
            1. Select Target Crop & Upload Leaf
          </h3>

          {/* Crop Selector */}
          <div className="form-group">
            <label className="form-label">Select Crop Type</label>
            <select 
              className="form-control" 
              value={selectedCrop} 
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setDiagnosisResult(null);
              }}
            >
              {SAMPLE_CROPS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Upload Area */}
          <div className="form-group">
            <label className="form-label">Crop Leaf Photo</label>
            <div 
              style={{
                border: '2px dashed #86efac',
                borderRadius: 'var(--radius-md)',
                padding: '2rem 1.5rem',
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
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageChange}
              />

              {imagePreview ? (
                <div style={{ width: '100%', position: 'relative' }}>
                  <img 
                    src={imagePreview} 
                    alt="Leaf Preview" 
                    style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'contain', margin: '0 auto', boxShadow: 'var(--shadow-sm)' }} 
                  />
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--primary-800)', fontWeight: 600 }}>
                    ✓ Image Loaded. Click to replace or run diagnosis below.
                  </div>
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
                    Click or Drag & Drop Leaf Image
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Supports JPG, PNG, WEBP (Max 10MB)
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Demo Sample Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
              Or test with preset crop templates:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Tomato', 'Wheat', 'Potato', 'Rice (Paddy)'].map((cp) => (
                <button
                  key={cp}
                  type="button"
                  onClick={() => handleSampleClick(cp)}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedCrop === cp ? 'var(--primary-100)' : '#ffffff',
                    color: selectedCrop === cp ? 'var(--primary-800)' : 'var(--text-muted)',
                    border: `1px solid ${selectedCrop === cp ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                    fontWeight: selectedCrop === cp ? 600 : 400
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
              style={{ flex: 1 }}
              onClick={runDiagnosis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={16} className="animate-pulse" />
                  <span>Scanning Pathology...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Run AI Diagnosis</span>
                </>
              )}
            </button>

            {imagePreview && (
              <button
                className="btn btn-secondary"
                onClick={resetScanner}
                title="Reset Image"
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Diagnosis Results */}
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
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>AI Pathology Analysis in Progress</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                Analyzing spectral chlorophyll absorption, lesion border necrosis, and fungal hyphae morphology...
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
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>No Diagnosis Generated Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto' }}>
                Upload or select a crop photo from the left panel and click <strong>"Run AI Diagnosis"</strong> to inspect leaf health and receive customized agronomic treatment plans.
              </p>
            </div>
          )}

          {!isAnalyzing && diagnosisResult && (
            <div className="glass-card" style={{ border: '1px solid var(--primary-200)' }}>
              
              {/* Diagnosis Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
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
                  </div>
                  <h2 style={{ fontSize: '1.6rem', color: 'var(--text-heading)' }}>
                    {diagnosisResult.diagnosis}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    Pathogen: {diagnosisResult.scientific_name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
                    {diagnosisResult.confidence}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Confidence Score</div>
                </div>
              </div>

              {/* Regional / Hindi Explanation Banner */}
              <div style={{ marginBottom: '1.25rem', background: '#fefce8', border: '1px solid #fef08a', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                  <HelpCircle size={15} /> किसान सलाह (Farmer Advisory in Hindi):
                </div>
                <p style={{ fontSize: '0.84rem', color: '#854d0e', lineHeight: '1.4' }}>
                  पत्तियों पर धब्बे दिखने पर तुरंत प्रभावित पत्तियों को अलग करें और अनुशंसित जैविक अथवा रासायनिक फफूंदनाशक का छिड़काव शाम के समय करें।
                </p>
              </div>

              {/* Symptoms Overview */}
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <AlertTriangle size={15} style={{ color: 'var(--accent-amber)' }} />
                  Clinical Symptoms Observed:
                </strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {diagnosisResult.symptoms}
                </p>
              </div>

              {/* Dual Action Treatment Protocols */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Chemical Treatment */}
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ color: '#991b1b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <FlaskConical size={16} /> Chemical Fungicide / Spray:
                  </strong>
                  <p style={{ fontSize: '0.84rem', color: '#7f1d1d', lineHeight: '1.5' }}>
                    {diagnosisResult.chemical_treatment}
                  </p>
                </div>

                {/* Organic Treatment */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ color: '#166534', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <Leaf size={16} /> Organic / Bio-Solution:
                  </strong>
                  <p style={{ fontSize: '0.84rem', color: '#14532d', lineHeight: '1.5' }}>
                    {diagnosisResult.organic_treatment}
                  </p>
                </div>
              </div>

              {/* Preventative Agronomic Measures */}
              <div style={{ marginBottom: '1.5rem' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <ShieldAlert size={16} style={{ color: 'var(--accent-gold)' }} />
                  Long-Term Cultural Prevention:
                </strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  {diagnosisResult.preventive_measures}
                </p>
              </div>

              {/* Action Plan Checklist */}
              {diagnosisResult.action_plan && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    <CheckSquare size={16} style={{ color: 'var(--primary-700)' }} />
                    Recommended Field Action Steps:
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {diagnosisResult.action_plan.map((item) => (
                      <div key={item.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: '#f8faf7', border: '1px solid var(--border-subtle)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
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
                          {item.step}
                        </span>
                        <div>
                          <strong style={{ color: 'var(--text-heading)', fontSize: '0.86rem' }}>{item.title}: </strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{item.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Disclaimer */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={14} /> AI Diagnostic Disclaimer: This preliminary tool assists agronomic scouting. Verify with your local Krishi Vigyan Kendra (KVK) agronomist before heavy chemical deployment.
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetectionPage;
