import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ChevronDown, Globe, ChevronUp } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';



const cn = (...classes) => classes.filter(Boolean).join(' ');


const Card = ({ className, children }) => (
  <div className={cn("bg-white shadow-md rounded-lg", className)}>
    {children}
  </div>
);

const CardHeader = ({ className, children }) => (
  <div className={cn("px-6 py-4 border-b", className)}>
    {children}
  </div>
);

const CardContent = ({ className, children }) => (
  <div className={cn("dropdown", className)}>
    {children}
  </div>

);




// Main Dashboard component
const Dashboard = () => {
  const [formStage, setFormStage] = useState('initial'); 
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [carData, setCarData] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState({
    years: [],
    makes: [],
    models: [],
    trims: []
  });
  const [selectedOption, setSelectedOption] = useState('make_model');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCarData();
  }, []);

  const fetchCarData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/all-vehicles-model.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCarData(data);
      const years = [...new Set(data.map(car => car.year))].sort().reverse();
      setFilteredOptions(prevState => ({ ...prevState, years }));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching car data:', error);
      setError(`Failed to fetch car data: ${error.message}`);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));

    // Update filtered options based on selection
    if (name === 'year') {
      const makes = [...new Set(carData.filter(car => car.year === value).map(car => car.make))].sort();
      setFilteredOptions(prevState => ({ ...prevState, makes, models: [], trims: [] }));
    } else if (name === 'make') {
      const models = [...new Set(carData.filter(car => car.year === formData.year && car.make === value).map(car => car.model))].sort();
      setFilteredOptions(prevState => ({ ...prevState, models, trims: [] }));
    } else if (name === 'model') {
      const trims = [...new Set(carData.filter(car => car.year === formData.year && car.make === formData.make && car.model === value).map(car => car.trany))].sort();
      setFilteredOptions(prevState => ({ ...prevState, trims }));
    }
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setFormStage('multi-step');
    setStep(1);
  };

  const handleMultiStepSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Here you would typically send the form data to your server
      console.log('Form submitted:', formData);
      setShowSuccessPopup(true);
    }
  };

  const renderInitialForm = () => {
    if (loading) return <p>Loading car options...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    switch (selectedOption) {
      case 'make_model':
        return (
          <>
            <select name="year" onChange={handleInputChange} className="select">
              <option value="">Select Year</option>
              {filteredOptions.years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select name="make" onChange={handleInputChange} className="select" disabled={!formData.year}>
              <option value="">Select Make</option>
              {filteredOptions.makes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
            <select name="model" onChange={handleInputChange} className="select" disabled={!formData.make}>
              <option value="">Select Model</option>
              {filteredOptions.models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            <select name="trim" onChange={handleInputChange} className="select" disabled={!formData.model}>
              <option value="">Select Trim</option>
              {filteredOptions.trims.map(trim => (
                <option key={trim} value={trim}>{trim}</option>
              ))}
            </select>
          </>
        );
      case 'vin':
        return <input name="vin" placeholder="VIN" onChange={handleInputChange} className="w-full p-2 mb-2 border rounded" />;
      case 'license_plate':
        return (
          <>
            <input name="licensePlate" placeholder="License Plate" onChange={handleInputChange} className="w-full p-2 mb-2 border rounded" />
            <input name="state" placeholder="State" onChange={handleInputChange} className="w-full p-2 mb-2 border rounded" />
          </>
        );
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Vehicle Info</h2>
      </CardHeader>
      <CardContent>
        <input
          name="mileage"
          placeholder="Enter Mileage"
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          name="zipCode"
          placeholder="Zip Code"
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <div className="mb-2">
          <p className="mb-1">Title</p>
          <div  className=" options-select">

          <label className="mr-42">
            <input
              type="radio"
              name="title"
              value="Clean"
              className="radio"
              onChange={handleInputChange}
            /> Clean
          </label>
          <label className="mr-42">
            <input
              type="radio"
              name="title"
              value="Salvage"
               className="radio"
              onChange={handleInputChange}
            /> Salvage
          </label></div>
        </div>
        <div>
          <p className="mb-1">Is the title in your name?</p>
          <div  className="options-select"><label className="mr-42">
            <input
              type="radio"
              name="titleInName"
              value="Yes"
               className="radio"
              onChange={handleInputChange}
            /> Yes
          </label>
          <label className="mr-42">
            <input
              type="radio"
              name="titleInName"
              value="No"
               className="radio"
              onChange={handleInputChange}
            /> No
          </label>
          </div></div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Vehicle Condition</h2>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <p className="mb-1">Has the vehicle been in any accidents?</p>
          <div  className=" options-select"><label className="mr-42">
            <input
              type="radio"
              name="accidents"
              value="Never"
              onChange={handleInputChange}
            /> Never
          </label>
          <label className="mr-42">
            <input
              type="radio"
              name="accidents"
              value="1 Accident"
              onChange={handleInputChange}
            /> 1 Accident
          </label>
          <label>
            <input
              type="radio"
              name="accidents"
              value="2+ Accident"
              onChange={handleInputChange}
            /> 2+ Accident
          </label></div>
        </div>
        <div className="mb-2">
          <p className="mb-1">Is your vehicle drivable?</p>
          <div  className=" options-select"><label className="mr-42">
            <input
              type="radio"
              name="drivable"
              value="Drivable"
              onChange={handleInputChange}
            /> Drivable
          </label>
          <label className="mr-42">
            <input
              type="radio"
              name="drivable"
              value="Not Drivable"
              onChange={handleInputChange}
            /> Not Drivable
          </label></div>
        </div>
        <div>
          <p className="mb-1">Has your vehicle been repainted?</p>
          <div  className=" options-select"> <label className="mr-42">
            <input
              type="radio"
              name="repainted"
              value="Original Paint"
              onChange={handleInputChange}
            /> Original Paint
          </label>
          <label className="mr-42">
            <input
              type="radio"
              name="repainted"
              value="Touched Up"
              onChange={handleInputChange}
            /> Touched Up
          </label>
          <label className="mr-42">
            <input
              type="radio"
              name="repainted"
              value="Fully Repainted"
              onChange={handleInputChange}
            /> Fully Repainted
          </label></div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Contact Info</h2>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Submit your information and our team of experts will contact you with an offer.</p>
        <input
          name="firstName"
          placeholder="First Name"
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          name="lastName"
          placeholder="Last Name"
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          name="phoneNumber"
          placeholder="Phone Number"
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
        />
      </CardContent>
    </Card>
  );

  const renderMultiStepForm = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <div className="form-section">
      <h1 className="form-section__title text-3xl font-bold mb-6">Request a quote now</h1>
      {formStage === 'initial' ? (
        <form onSubmit={handleInitialSubmit} className="form-section__initial-form max-w-md mx-auto">
          <Card className="form-section__card">
  <CardHeader className="form-section__card-header">
    <h2 className="form-section__card-title text-xl font-bold">Car Selection</h2>
  </CardHeader>
  <CardContent className="form-section__card-content">
    <div className="form-section__select-container">
      <div
        className={`tab ${selectedOption === "make_model" ? "active" : ""}`}
        onClick={() => setSelectedOption("make_model")}
      >
        Make / Model
      </div>
      <div
        className={`tab ${selectedOption === "vin" ? "active" : ""}`}
        onClick={() => setSelectedOption("vin")}
      >
        VIN
      </div>
      <div
        className={`tab ${selectedOption === "license_plate" ? "active" : ""}`}
        onClick={() => setSelectedOption("license_plate")}
      >
        License Plate
      </div>
    </div>
    {renderInitialForm()}
  </CardContent>
</Card>
          <button type="submit" className="form-section__submit-btn w-full bg-orange-500 text-white p-2 rounded mt-4 hover:bg-orange-600">
            Next
          </button>
        </form>
      ) : (
        <>
          <div className="options-step flex justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("form-section__step flex items-center", s <= step ? "text-orange-500" : "text-gray-400")}>
                <div className={cn("form-section__step-circle w-8 h-8 rounded-full flex items-center justify-center mr-2", s <= step ? "bg-orange-500 text-white" : "bg-gray-200")}>
                  {s}
                </div>
                <span className="form-section__step-label">
                  {s === 1 ? "Vehicle Info" : s === 2 ? "Vehicle Condition" : "Contact Info"}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleMultiStepSubmit} className="form-section__multi-step-form max-w-md mx-auto">
            {renderMultiStepForm()}
            <div className="form-section__button-group flex justify-between mt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="form-section__back-btn bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  {step === 2 ? "GO BACK" : "BACK"}
                </button>
              )}
              <button
                type="submit"
                className={cn("form-section__next-btn bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600", step === 1 && "ml-auto")}
              >
                {step < 3 ? "NEXT" : "SUBMIT"}
              </button>
            </div>
          </form>
        </>
      )}
  
      {showSuccessPopup && (
        <div className="form-section__popup-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="form-section__popup-card bg-white p-8">
            <CardHeader className="form-section__popup-header">
              <h2 className="form-section__popup-title text-2xl font-bold mb-4">Thank You!</h2>
            </CardHeader>
            <CardContent className="form-section__popup-content">
              <p>We've received your information. Our team of experts will contact you with an offer soon.</p>
              <button onClick={() => setShowSuccessPopup(false)} className="form-section__popup-close-btn mt-4 bg-orange-500 text-white p-2 rounded hover:bg-orange-600">
                Close
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
  
};






const HowItWorks = () => {
  return (
    <div className="how-it-works text-center py-10">
      <h2 className="text-3xl font-bold mb-6">How It Works</h2>
      <div className="steps flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-8">
        <div className="step flex flex-col items-center">
          <img src="/price.png" alt="Get your offer" className="icon w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Get your offer</h3>
          <p>It takes 2 minutes</p>
        </div>
        <div className="step flex flex-col items-center">
          <img src="/calendar.png" alt="Make an appointment" className="icon w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Make an appointment</h3>
          <p>Contact us to schedule your appointment</p>
        </div>
        <div className="step flex flex-col items-center">
          <img src="/ticket.png" alt="Come get paid" className="icon w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Come get paid</h3>
          <p>To receive payment, please submit your invoice promptly</p>
        </div>
      </div>
    </div>
  );
};






const Header = () => (
  <div className="header">
    <img src="/111 1.png" alt="logo" className="logo" />
    <button className="btn-main">Contact Us</button>
  </div>
);

const Hero = () => {
  return (
    <div
      className="hero bg-cover bg-center h-screen flex flex-col md:flex-row items-center justify-between px-4 md:px-20 py-20 md:py-0"
      style={{ backgroundImage: "url('https://hatzs.com/wp-content/uploads/2024/09/image-1-5.png')" }}
    >
      <div className="hero-text w-full md:w-2/5 text-left mb-8 md:mb-0">
        <h1 className="text-white text-4xl md:text-6xl font-bold">
          Track Your Vehicle With Us
        </h1>
        <p className="text-white text-lg md:text-2xl mt-4 max-w-xl">
          Since 1981 we provide our clients high quality custom cabinetry,
          furniture, architectural millwork, and finish carpentry.
        </p>
      </div>
      <Dashboard />
    </div>
  );
};

const ServicesSection = () => (
  <div className="services-section">
    <div className="ser-header">
      <div className="header-logo">
        <img src="/Image (3).png" alt="start" />
        <p className="p-logo">Our Services</p>
      </div>
      <div className="header-text">
        <h2>Explore our wide range of rental services</h2>
      </div>
    </div>

    <ServiceItem
      imageUrl="/1stleft.png"
      title="Tell Us About Your Vehicle"
      description="Give us a quick rundown of your car. Where it's located will help us craft our best offer. Give us a quick rundown of your car. Where it's located will help us craft our best offer."
      reverse={false}
    />

    <ServiceItem
      imageUrl="/image 22.png"
      title="Get Your Instant Offer"
      description="Get your obligation-free instant choose a convenient date and time for your appointment. Get your obligation-free instant choose a convenient date and time for your appointment."
      reverse={true}
    />

    <ServiceItem
      imageUrl="/image 24.png"
      title="Setup Pickup Details"
      description="Get your obligation-free instant phone offer and choose a convenient date and time. Get your obligation-free instant phone offer and choose a convenient date and time."
      reverse={false}
    />

    <div className="service-footer">
      <p>
        Discover our range of Car Tracking Services designed to meet all your
        travel needs. From a diverse fleet of vehicles to flexible Tracking
        plans.
      </p>
      <button className="btn-main">Contact us</button>
    </div>
  </div>
);

const ServiceItem = ({ imageUrl, title, description, reverse }) => (
  <div className={`service-main ${reverse ? 'flex-row-reverse' : ''}`}>
    <div className="service-left">
      <img src={imageUrl} className="ser-image" alt="" />
    </div>
    <div className="service-right">
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="btn-service">Learn more</button>
    </div>
  </div>
);

const TrustedPartner = () => (
  <div className="trusted-partner flex flex-col md:flex-row justify-center items-center gap-10 px-4 py-10 md:px-20">
    <div className="trusted-left w-full md:w-2/5">
      <img src="/1stleft.png" alt="Trusted Partner" className="w-full h-full object-cover" />
    </div>

    <div className="trusted-right w-full md:w-2/5 flex flex-col justify-center items-start">
      <div className="header-logo flex items-center mb-4">
        <img src="/star.png" alt="Star Icon" className="w-10 h-10" />
        <p className="p-logo text-lg font-semibold ml-2">About Us</p>
      </div>

      <h3 className="text-3xl md:text-5xl font-bold text-black mb-4">
        Your trusted partner in reliable car tracking
      </h3>

      <p className="text-base font-normal mb-4">
        Aqestic Optio Amet A Ququam Saepe Aliquid Voluate Dicta Fuga Dolor
        Saerror Sed Earum A Magni Soluta Quam Minus Dolor Dolor
      </p>

      <FeatureItem
        iconSrc="/ins.png"
        title="Easily Installing Process"
        description="We have optimized the installing process so that our clients can experience the easiest and the safest service."
      />

      <FeatureItem
        iconSrc="/car.png"
        title="Convenient Tracking & Installing Process"
        description="We have optimized the tracking process so that our clients can experience the easiest and the safest service."
      />
    </div>
  </div>
);

const FeatureItem = ({ iconSrc, title, description }) => (
  <div className="right-feature flex items-center py-4 mt-6 w-full border-b border-gray-200">
    <div className="feature-left w-1/5">
      <img src={iconSrc} alt={title} className="w-16 h-20" />
    </div>
    <div className="feature-right w-4/5 ml-4">
      <h4 className="text-lg font-bold">{title}</h4>
      <p className="text-base font-normal">{description}</p>
    </div>
  </div>
);







const Testimonial = () => {
  const testimonials = [
    {
      rating: 4,
      comment: "Renting a car from nova ride was a great decision. Not only did I get a reliable and comfortable vehicle, but the prices were also very competitive.",
      author: "Annette black",
      role: "Project manager",
      image: "/4img.png"
    },
    {
      rating: 3,
      comment: "Renting a car from nova ride was a great decision. Not only did I get a reliable and comfortable vehicle, but the prices were also very competitive.",
      author: "Leslie alexander",
      role: "Project manager",
      image: "/3img.png"
    },
    {
      rating: 5,
      comment: "Renting a car from nova ride was a great decision. Not only did I get a reliable and comfortable vehicle, but the prices were also very competitive.",
      author: "Alis white",
      role: "Project manager",
      image: "/client.png"
    },
    {
      rating: 4,
      comment: "Renting a car from nova ride was a great decision. Not only did I get a reliable and comfortable vehicle, but the prices were also very competitive.",
      author: "Alis white",
      role: "Project manager",
      image: "/2img.png"
    },
    {
      rating: 4,
      comment: "Renting a car from nova ride was a great decision. Not only did I get a reliable and comfortable vehicle, but the prices were also very competitive.",
      author: "Alis white",
      role: "Project manager",
      image: "/client.png"
    },
    {
      rating: 5,
      comment: "Renting a car from nova ride was a great decision. Not only did I get a reliable and comfortable vehicle, but the prices were also very competitive.",
      author: "Alis white",
      role: "Project manager",
      image: "/3img.png"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - slidesToShow : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex + slidesToShow) >= testimonials.length ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="w-full py-20 flex flex-col items-center gap-16">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/star.png" alt="star" className="w-6 h-6" />
          <p className="text-lg font-semibold">Testimonials</p>
        </div>
        <h2 className="text-3xl font-bold">What our customers are saying about us</h2>
      </div>

      <div className="w-full flex flex-wrap justify-center gap-8">
        {testimonials.slice(currentIndex, currentIndex + slidesToShow).map((testimonial, index) => (
          <div key={index} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] max-w-md bg-white rounded-3xl p-6 border border-gray-200">
            <div className="flex mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
  <img 
    key={star} 
    src={star <= testimonial.rating ? "/Symbol2.png" : "/Symbol.png"} 
    alt={star <= testimonial.rating ? "Filled star" : "Empty star"} 
    className="w-5 h-5"
  />
))}
            </div>
            <p className="text-gray-600 mb-4">{testimonial.comment}</p>
            <div className="flex items-center gap-3">
              <img src={testimonial.image} alt={`${testimonial.author}'s avatar`} className="w-12 h-12 rounded-full" />
              <div>
                <h4 className="text-lg font-semibold">{testimonial.author}</h4>
                <span className="text-sm text-gray-600">{testimonial.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={handlePrevClick} className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button onClick={handleNextClick} className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

const BgVideoDiv = () => (
  <div className="bd-video-div">
    <div className="ser-header">
      <div className="header-logo">
        <img src="/star.png" alt="start" />
        <p className="p-logo">We buy all year makes and models</p>
      </div>
      <div className="header-text">
        <h2>Any Car, Any Year, Any Model We're ready to Buy</h2>
      </div>
    </div>

    <div className="video-container">
      <video autoPlay loop muted className="bg-video">
        <source src="/your-video-file.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>

    <div className="logos">
      <img src="audi.png" alt="Audi" />
      <img src="jaguar.png" alt="Jaguar" />
      <img src="volkswagon.png" alt="Volkswagen" />
      <img src="acura.png" alt="Acura" />
      <img src="honda.png" alt="Honda" />
      <img src="toyota.png" alt="Toyota" />
    </div>
  </div>
);






const Accordion = ({ children }) => {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (name) => {
    setActiveSection(activeSection === name ? null : name); // Toggles between opening and closing
  };

  return (
    <div className="accordion">
      {children.map((item) => (
        <div
          key={item.props.name}
          className={`accordion-item ${activeSection === item.props.name ? 'active' : ''}`}
        >
          <div className="accordion-header" onClick={() => toggleSection(item.props.name)}>
            <span>{item.props.label}</span>
            <span className={`accordion-icon ${activeSection === item.props.name ? 'active' : ''}`}>
              {activeSection === item.props.name ? '-' : '+'}
            </span>
          </div>
          {activeSection === item.props.name && ( // Only show content when the section is active
            <div className="accordion-content">
              {item.props.children}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const AccordionItem = ({ name, label, children }) => {
  return (
    <>{children}</> // Children will be rendered inside the Accordion component
  );
};

Accordion.Item = AccordionItem;


const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div 
    className={`border-b border-gray-200 transition-all duration-300 ease-in-out ${
      isOpen ? 'bg-orange-50 scale-98' : 'bg-white'
    }`}
  >
    <button
      className="flex justify-between items-center w-full p-5 text-left"
      onClick={onClick}
    >
      <span className="font-medium">{question}</span>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-orange-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </button>
    {isOpen && (
      <div className="px-5 pb-5">
        <p className="text-gray-600">{answer}</p>
      </div>
    )}
  </div>
);

const FAQComponent = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "Can I sell car to Car trackers without buying a car from Car trackers?",
      answer: "Yes, you can sell your car to Car Trackers even if you haven't purchased a car from them. They accept vehicles for sale regardless of where you originally bought your car."
    },
    {
      question: "Is the online offer a real offer or an estimate?",
      answer: "The online offer is typically an estimate based on the information you provide. A final offer may be subject to an in-person inspection of your vehicle."
    },
    {
      question: "Can I negotiate my online offer?",
      answer: "While the online offer is generally firm, you may have the opportunity to negotiate during an in-person appraisal if your car's condition differs from what was described online."
    },
    {
      question: "Can I get both an online and in-store appraisal?",
      answer: "Yes, you can get an online appraisal first and then visit a Car Trackers location for an in-person appraisal to confirm or adjust the offer based on the actual condition of your vehicle."
    },
    {
      question: "What I do after I get an online offer?",
      answer: "After receiving an online offer, you can schedule an appointment at a Car Trackers location for an in-person inspection and to complete the sale if you decide to proceed."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-orange-500 text-sm font-semibold text-center mb-8">FAQs</p>
      <h2 className="text-3xl font-bold text-center mb-2">Frequently Asked Questions</h2>
    
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={index === openIndex}
            onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
          />
        ))}
      </div>
    </div>
  );
};


const CarTrackersLanding = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = ['Browse And Track', 'Book And Confirm', 'Wait And Enjoy'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
        <div className="header-logo">
          <img src="/star.png" alt="star" width={32} height={32} />
          <h2 style={{ color: '#FF8713' }}>How it works</h2>
        </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Why wait? Sell your car today with Car Trackers
          </h1>
          <p className="text-gray-600 mb-8">
            Get an estimate on your car's value online, and see why so many Southern
            California drivers choose to sell their cars with Car Trackers.
          </p>

          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section} className="border-b pb-2">
                <button
                  className="w-full flex justify-between items-center py-2 px-4 hover:bg-gray-100 rounded"
                  onClick={() => toggleSection(section)}
                >
                  <span className="flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    {section}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    expandedSection === section ? 'transform rotate-180' : ''
                  }`} />
                </button>
                {expandedSection === section && (
                  <p className="mt-2 text-gray-600 px-4">
                    Additional information about {section} goes here.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="md:w-1/2 relative">
          <div className=" overflow-hidden ">
            <img
              src="/rightimg.png"
              width={400}
              height={300}
              alt="Person standing on a yellow car holding a SOLD! sign"
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 right-0 bg-orange-500 p-4 rounded-tl-lg">
              <div className="text-white font-bold text-sm">
                4m+ Trusted<br />
                world wide<br />
                global clients
              </div>
              <div className="flex -space-x-2 mt-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white" />
                ))}
                <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold">
                  +
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};







const Footer = () => (
  <div className="footer">
    <div className="footer-1">
      <InfoBlock
        icon="/map.png"
        title="Address"
        content="121 King Street, Melbourne Victoria 3000 Australia"
      />
      <InfoBlock
        icon="/mob.png"
        title="Emergency (24/7)"
        content="Mobile: +01 2342543378 Free Line: 123 456 789"
      />
      <InfoBlock
        icon="/mail.png"
        title="Email"
        content="info@youremail.com mail@themedept.com"
      />
      <InfoBlock
        icon="/time.png"
        title="Working Hours"
        content="Mon to Sat - 9 AM to 11 PM Sunday 10 AM to 6 PM"
      />
    </div>

    <div className="footer-2">
      <p className="copyright">Copyright © 2024 CarTrackers</p>

      <div className="social-icons">
        <a href="#"><img src="/fb.png" alt="Facebook" /></a>
        <a href="#"><img src="/tweet.png" alt="Twitter" /></a>
        <a href="#"><img src="/ig.png" alt="Instagram" /></a>
   
      </div>
    </div>
  </div>
);

const InfoBlock = ({ icon, title, content }) => (
  <div className="info-block">
    <img src={icon} alt={title} />
    <h3>{title}</h3>
    <p>{content}</p>
  </div>
);

// Main page component
export default function Home() {
  return (
    <div>
      <Head>
        <title>Car Information Lookup</title>
        <meta name="description" content="Look up car information" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
      <Header />
      <Hero />
      <HowItWorks/>
       
     
        <TrustedPartner />
     
  
        <Testimonial />
        <BgVideoDiv />
    
    <FAQComponent/>
      <CarTrackersLanding/>
        <Footer/>
      </main>

      <style jsx global>{`

@media (max-width: 768px) {
 
 
  .form-section{
width: 100%!important;
  }
  .how-it-works{
    margin-top: 0px!important;
  }
}


@media (max-width: 768px) {
    .header {
        position: static!important;
    }
}
        * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        font-family: "Lato", sans-serif;
}

.header-text-{
color: black;
 font-size: 44px;
                        color: black;
                        font-weight: 700;
                        max-width: 650px;
                        margin: 10px auto;
}
.bd-video-div {
  position: relative;
  width: 100%;

  overflow: hidden; /* Hide overflow */
  background-image: url('cover.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1; /* Place the video container above the background image */
}

.bg-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: 1;
  transform: translate(-50%, -50%);
  object-fit: cover; /* Cover the entire container */
}

.video-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Cover the entire video container */
  z-index: 2; /* Above the video */
}

.ser-header {
  position: relative;
  z-index: 3; /* Above video */
  text-align: center;
  padding: 20px;
}

.header-logo img {
  max-width: 100px; /* Adjust logo size as needed */
}

.header-text h2 {
  color: white!important; 
  margin: 20px 0;
}

.logos {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 20px 0;
}

.logos img {
  margin: 0 10px; /* Spacing between logos */
  max-height: 50px; /* Adjust logo height */
}


select{

     background: white;
    padding: 8px;
    color: #444444;
    border-radius: 4px;
}

input{

     background: white;
    padding: 8px;
    color: #444444;
    border-radius: 4px;
}

.form-section__select-container {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #ddd; /* Light gray underline */
}

.form-section button{
 margin-top:20px;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #333; /* Darker text for better contrast */
  background-color: #fff; /* White background */
  border-bottom: 2px solid transparent; /* Base border for unselected */
  transition: all 0.3s ease;
}

.tab.active {
  color: #000; /* Black for active tab text */
  border-bottom: 2px solid #000; /* Black underline for active tab */
  background-color: #f0f0f0; /* Slight gray background for active tab */
}

.tab:hover {
  color: #000; /* Black on hover */
  background-color: #e0e0e0; /* Bright background on hover */
}

.form-section__card-content {
  padding-top: 20px;
 
}

.how-it-works {
margin-top: -100px!important;
  width: 80%;
  margin: 0 auto; /* Center the component */
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.how-it-works h2 {
  color: #ff7f50; /* Orange color */
  margin-bottom: 20px;
}

.steps {
  display: flex;
  justify-content: space-around; /* Space out the steps */
  flex-wrap: wrap; /* Wrap items on smaller screens */
}

.step {
  flex: 1; /* Allow each step to grow equally */
  margin: 10px; /* Add spacing between steps */
  max-width: 250px; /* Limit width of each step */
}

.icon {
  width: 50px; /* Set a fixed width for the icons */
  height: 50px; /* Set a fixed height for the icons */
  margin-bottom: 10px;
}


.form-section__step{
display: flex ;
flex-direction: row;
gap: 12px;
align-content : center;
justify-content: center;

}

.options-select{
  display: flex;
  gap: 20px;
}

.options-step{
background-color: grey;
          display: flex;
    flex-direction: row;
    justify-content: space-around;
   
    padding-bottom: 20px;
    padding-top: 20px;
}

.dropdown{
 display: flex;
 flex-direction : column;
 gap: 10px;
}
body {
        width: 98.9vw;
        height: 100vh;

}
:root {
        --primary-color: #FF8713;
    }

.main-section {
    position: relative;
    padding: 20px 150px;
    width: 100%;
    height: 100vh;
    background-image: url('https://i.ibb.co/pxGMMMf/image-1-5.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 1; /* Ensures content is above the overlay */
}

.main-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.35); 
    z-index: -1; 
}

.header {

    padding-bottom: 20px;
    background-color: #00000038;

width: 100%;
    
    position: absolute;
    display: flex;
    justify-content: space-between;
padding-left : 200px;
padding-right : 200px;
padding-top:30px;

        height: 13%;
        display: flex;
        justify-content: space-between;
        align-items: center;
}

.mr-42{
   display: flex;
   gap: 10px;
   justify-content: center;
   align-content: center;
   align-items: center;

}

.radio{
  margin-bottom: 0px!important;
}
        .btn-main{
                padding: 16px 31px;
                background-color: var(--primary-color);
                color: white;
                border-radius: 5px;
                border: none;
                font-size: 15px;
                font-weight: 700;
        }


.form-section {
        background-color: rgba(0, 0, 0, 0.4);
        padding: 20px;
        width: 35%;
        color: white;
        min-height: 70%;
    }
    .form-section h3 {
        font-size: 26px;
        font-weight: 900;
        margin-bottom: 5px;
    }
    .form-section p {
        margin-bottom: 30px;
        font-size: 16px;
        font-weight: 400;
    }
    .form-section input, .form-section textarea {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        min-height: 20px;
    }
    .form-section textarea {
        height: 140px;
    }
    .form-section button {
        width: 100%;
        padding: 8px 31px;
                background-color: var(--primary-color);
                color: white;
                border-radius: 5px;
                border: none;
                font-size: 15px;
                font-weight: 700;
    }
 

.services-section{
        width: 100%;
        background-color: white;
        min-height: 100vh;
        padding: 100px 150px;
        box-sizing: border-box;
}
        .ser-header {
                width: 100%;
                text-align: center;
        }
                .header-logo{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 15px;
                        color: var(--primary-color);
                }
                        .header-logo p {
                          font-family: 16px;
                          font-weight: 600;
                        }
                .header-text h2 {
                        font-size: 44px;
                        color: black;
                        font-weight: 700;
                        max-width: 650px;
                        margin: 10px auto;
                }

.service-main {
        width: 100%;
        height: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 100px;
        padding: 80px 0;
}
        .service-left{
                width: 50%;
        }
                .service-left img {
                        width: 100%;
                        height: 100%;
                }
        .service-right {
                width: 50%;
        }
                .service-right h3 {
                        font-size: 52px;
                        font-weight: 700;
                        color: rgba(0, 0, 0, 1);
                }
                .service-right p {
                        font-size: 20px;
                        font-weight: 400;
                        margin: 20px 0;
                }
                .btn-service {
                        padding: 10px 31px;
                        background-color: var(--primary-color);
                        color: white;
                        border-radius: 48px;
                        border: none;
                        font-size: 15px;
                        font-weight: 700;  
                }

.service-footer {
        width: 100%;
        text-align: center;
}
        .service-footer p {
                font-size: 28px;
                font-weight: 400;
                color: black;
                max-width: 800px;
                margin: 20px auto;
        }
 



/* FAQ section styling */
title
{
  font-size: 3rem;
  margin: 2rem 0;
}

.faq
{
  width: 100%;
  margin-top: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(236, 236, 236, 1);
  cursor: pointer;
}

.question
{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question h3
{
  font-size: 20px;
}

.answer
{
  max-height: 0;
  overflow: hidden;
  transition: max-height .5s ease-in-out;
}

.answer p
{
  padding-top: 1rem;
  line-height: 1.6;
  font-size: 16px;
}

.faq.active .answer
{
  max-height: 300px;
}



/* next div */

.bg-blur {
        padding: 20px 150px;
        width: 100%;
        height: 60vh;
        background-image: url('image\ \(4\).png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-color: rgba(0, 0, 0, 0.35);

        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
}

.bg-blur p
{
  padding: 1rem 0;
  line-height: 1.6;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 700px;
  text-align: center;
}

.bg-blur h3 {
        font-size: 37px;
        font-weight: 900;
        color: white;
}

.btn-bgBlur {
        padding: 16px 110px;
        background-color: var(--primary-color);
        color: white;
        /* border-radius: 5px; */
        border: none;
        font-size: 16px;
        font-weight: 900;
}


        .next {
                background-image: url('next.png');
        }
        .prev {
                background-image: url('back.png');
        }

.bd-video-div {
        width: 100%;
     
        padding: 80px 100px;
        background-image: url('cover.png');
        background-position: center;
        background-size: cover;
        background-color: rgba(0, 0, 0, 0.35);
        
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-direction: column;
        gap: 50px;
        color: white;
}

        .logos {
                border-top: 2px solid rgba(255, 255, 255, 0.75);
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 40px;
                padding-top: 60px;
        }

.quality {
        width: 100%;
        min-height: 100vh;
        padding: 80px 100px;
        background-image: url('why-choose-us-bg.svg\ fill.png');
        background-position: center;
        background-size: contain;
        
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 50px;
}

        .content-div {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 50px;
        }
        .content-img img {
                width: 100%;
                height: 100%;
                border-radius: 30px;
        }
        .content {
                width: 33%;
                height: 100%;
        }
        .box-content {
                padding: 50px 0;
                display: flex;
                justify-content: center;
                align-items: start;
                gap: 20px;
        }
        .box-text h4 {
                font-size: 20px;
                font-weight: 600;
                color: rgba(4, 4, 1, 1);
        }
        .box-text p {
                padding: 15px 0;
                font-size: 16px;
                font-weight: 400;
                color: rgba(97, 97, 97, 1);
        }

.badge {
        width: 100%;
        min-height: 60vh;
        padding: 80px;
        background-image: url('cta-box-bg.svg\ fill.png');
        background-position: center;
        background-size: contain;
        background-color: rgba(4, 4, 1, 1);

        display: flex;
        justify-content: space-evenly;
        align-items: center;
        gap: 50px;
        color: white;
}

        .badge-text {
                width: 80%;
        }
                .badge-text h2 {
                        font-size: 79px;
                        font-weight: 900;
                        max-width: 1000px;
                }
                .badge-text p {
                        font-size: 18px;
                        font-weight: 400;
                        max-width: 1000px;
                        margin-top: 20px;
                }
        .badge-img {
                width: 20%;
        }

.footer {
        width: 100%;
        min-height: 60vh;
        padding-top: 80px;
        background-color: rgba(255, 135, 19, 1);
}

        .footer-1 {
                width: 100%;
                min-height: 40vh;

                display: flex;
                justify-content: space-evenly;
                align-items: center;
        }
                .info-block {
                        display: flex;
                        justify-content: space-evenly;
                        align-items: center;
                        flex-direction: column;
                        text-align: center;
                }
                .info-block h4 {
                        color: white;
                        font-size: 26px;
                        font-weight: 900;
                        padding-top: 5px;
                }
                .info-block p {
                        color: white;
                        padding: 10px 0;
                        font-size: 16px;
                        font-weight: 400;
                        max-width: 200px;
                }
        .footer-2 {
                background-color: rgba(208, 107, 9, 1);
                width: 100%;
                min-height: 15vh;
                color: white;

                display: flex;
                justify-content: space-evenly;
                align-items: center;
        }
                .copyright {
                        font-size: 15px;
                        font-weight: 700;
                }
                .links {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 20px;
                }
                        .links a {
                                font-size: 15px;
                                font-weight: 700;
                                color: white;
                                text-decoration: none;
                        }
                .social-icons {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 20px;
                }
      `}</style>
    </div>
  );
}