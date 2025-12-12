import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";

// Predefined medical conditions/symptoms organized by category
const PREDEFINED_TAGS = {
  ocularDiseases: [
    "Diabetic Retinopathy",
    "Glaucoma",
    "Age-Related Macular Degeneration",
    "Cataracts",
    "Dry Eye Syndrome",
    "Conjunctivitis",
    "Uveitis",
    "Retinal Detachment",
    "Macular Edema",
    "Macular Hole",
    "Epiretinal Membrane",
    "Retinitis Pigmentosa",
    "Central Serous Retinopathy",
    "Optic Neuritis",
    "Papilledema",
    "Keratoconus",
    "Pterygium",
    "Blepharitis",
    "Chalazion",
    "Strabismus",
    "Amblyopia",
    "Myopia",
    "Hyperopia",
    "Astigmatism",
    "Presbyopia",
    "Corneal Ulcer",
    "Endophthalmitis",
    "Vitreous Hemorrhage",
    "Branch Retinal Vein Occlusion",
    "Central Retinal Vein Occlusion",
    "Hypertensive Retinopathy",
    "Disc Edema",
    "Macular Scar",
  ],
  systemicConditions: [
    "Diabetes Type 1",
    "Diabetes Type 2",
    "Hypertension",
    "High Blood Pressure",
    "Cardiovascular Disease",
    "Heart Disease",
    "Stroke",
    "Hyperlipidemia",
    "High Cholesterol",
    "Obesity",
    "Thyroid Disease",
    "Hyperthyroidism",
    "Hypothyroidism",
    "Autoimmune Disease",
    "Rheumatoid Arthritis",
    "Lupus",
    "Multiple Sclerosis",
    "Sarcoidosis",
    "Anemia",
    "Liver Disease",
    "Cancer",
    "HIV/AIDS",
    "Tuberculosis",
  ],
  neurologicalDisorders: [
    "Alzheimer's Disease",
    "Parkinson's Disease",
    "Dementia",
    "Epilepsy",
    "Migraine",
    "Cluster Headache",
    "Neuropathy",
    "Peripheral Neuropathy",
    "Cranial Nerve Palsy",
    "Intracranial Hypertension",
    "Brain Tumor",
    "Meningitis",
    "Encephalitis",
    "Traumatic Brain Injury",
  ],
  neurodegenerativeDisorders: [
    "Amyotrophic Lateral Sclerosis (ALS)",
    "Huntington's Disease",
    "Frontotemporal Dementia",
    "Progressive Supranuclear Palsy",
    "Lewy Body Dementia",
    "Multiple System Atrophy",
    "Spinocerebellar Ataxia",
    "Motor Neuron Disease",
  ],
  cvdSymptoms: [
    "Chest Pain",
    "Shortness of Breath",
    "Palpitations",
    "Syncope",
    "Claudication",
    "Edema",
    "Cyanosis",
    "Orthopnea",
    "Paroxysmal Nocturnal Dyspnea",
    "Carotid Artery Disease",
    "Coronary Artery Disease",
    "Atrial Fibrillation",
    "Heart Failure",
    "Peripheral Artery Disease",
    "Deep Vein Thrombosis",
    "Pulmonary Embolism",
  ],
  symptoms: [
    "Blurred Vision",
    "Double Vision",
    "Floaters",
    "Flashes of Light",
    "Eye Pain",
    "Eye Redness",
    "Itching",
    "Burning Sensation",
    "Tearing",
    "Dry Eyes",
    "Light Sensitivity",
    "Night Blindness",
    "Peripheral Vision Loss",
    "Central Vision Loss",
    "Color Vision Changes",
    "Headache",
    "Nausea",
    "Dizziness",
    "Fatigue",
  ],
  medications: [
    "Insulin",
    "Metformin",
    "Blood Pressure Medication",
    "Statins",
    "Aspirin",
    "Anticoagulants",
    "Steroids",
    "Immunosuppressants",
    "Anti-VEGF Injections",
    "Eye Drops",
    "Glaucoma Drops",
  ],
  surgeries: [
    "Cataract Surgery",
    "LASIK",
    "PRK",
    "Vitrectomy",
    "Retinal Laser",
    "Trabeculectomy",
    "Corneal Transplant",
    "Scleral Buckle",
  ],
};

// Flatten all tags into a single array
const getAllPredefinedTags = () => {
  return Object.values(PREDEFINED_TAGS).flat();
};

// Get custom tags from localStorage
const getCustomTags = (): string[] => {
  try {
    const stored = localStorage.getItem('eyeq_custom_tags');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save custom tag to localStorage
const saveCustomTag = (tag: string) => {
  const customTags = getCustomTags();
  if (!customTags.includes(tag)) {
    customTags.push(tag);
    localStorage.setItem('eyeq_custom_tags', JSON.stringify(customTags));
  }
};

interface MedicalTagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function MedicalTagInput({ value, onChange, placeholder = "Type to search conditions..." }: MedicalTagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allTags = [...getAllPredefinedTags(), ...getCustomTags()];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterSuggestions = (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    
    const lowercaseInput = input.toLowerCase();
    const filtered = allTags
      .filter(tag => 
        tag.toLowerCase().includes(lowercaseInput) && 
        !value.includes(tag)
      )
      .slice(0, 10);
    
    setSuggestions(filtered);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    filterSuggestions(newValue);
    setShowSuggestions(true);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      // If this is a new custom tag, save it
      if (!allTags.includes(trimmedTag)) {
        saveCustomTag(trimmedTag);
      }
      onChange([...value, trimmedTag]);
    }
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        addTag(suggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const showAddNewOption = inputValue.trim() && 
    !suggestions.some(s => s.toLowerCase() === inputValue.toLowerCase()) &&
    !value.some(v => v.toLowerCase() === inputValue.toLowerCase());

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Tags Display */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          padding: "8px",
          minHeight: "42px",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          cursor: "text",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "16px",
              backgroundColor: "#0891b2",
              color: "white",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(255,255,255,0.2)",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <X size={10} color="white" />
            </button>
          </span>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.trim()) {
              setShowSuggestions(true);
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          style={{
            flex: 1,
            minWidth: "120px",
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            fontSize: "14px",
            padding: "4px",
          }}
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || showAddNewOption) && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                backgroundColor: index === highlightedIndex ? "#ecfeff" : "transparent",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                color: "#374151",
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion}
            </button>
          ))}
          
          {showAddNewOption && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                borderTop: suggestions.length > 0 ? "1px solid #e5e7eb" : "none",
                backgroundColor: highlightedIndex === suggestions.length ? "#ecfeff" : "#f0fdf4",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                color: "#059669",
                fontWeight: 500,
              }}
            >
              <Plus size={16} />
              Add "{inputValue}" as new tag
            </button>
          )}
        </div>
      )}

      {/* Helper text */}
      <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px" }}>
        Start typing to search conditions, or add custom tags
      </p>
    </div>
  );
}