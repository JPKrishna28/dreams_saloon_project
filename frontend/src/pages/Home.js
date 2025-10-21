import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scissors as ScissorsIcon, 
  Star as StarIcon, 
  Clock as ClockIcon, 
  MapPin as MapPinIcon, 
  Phone as PhoneIcon, 
  CheckCircle as CheckCircleIcon,
  Users as UserGroupIcon,
  TrendingUp as TrendingUpIcon,
  Award as AwardIcon
} from 'lucide-react';

const Home = () => {
  const services = [
    {
      id: 1,
      name: 'Hair Cut',
      price: 150,
      duration: '30 min',
      description: 'Professional hair cutting with modern styles',
      image: '✂️',
      popular: true
    },
    {
      id: 2,
      name: 'Beard Trim',
      price: 80,
      duration: '20 min',
      description: 'Expert beard trimming and shaping',
      image: '🧔',
      popular: false
    },
    {
      id: 3,
      name: 'Shave',
      price: 100,
      duration: '25 min',
      description: 'Traditional wet shave with premium products',
      image: '🪒',
      popular: false
    },
    {
      id: 4,
      name: 'Hair Styling',
      price: 200,
      duration: '45 min',
      description: 'Professional styling for special occasions',
      image: '💇‍♂️',
      popular: true
    },
    {
      id: 5,
      name: 'Hair Wash',
      price: 50,
      duration: '15 min',
      description: 'Refreshing hair wash with quality shampoo',
      image: '🚿',
      popular: false
    },
    {
      id: 6,
      name: 'Facial',
      price: 300,
      duration: '60 min',
      description: 'Deep cleansing facial treatment',
      image: '🧴',
      popular: false
    },
    {
      id: 7,
      name: 'Massage',
      price: 250,
      duration: '45 min',
      description: 'Relaxing head and shoulder massage',
      image: '💆‍♂️',
      popular: false
    },
    {
      id: 8,
      name: 'Complete Grooming',
      price: 500,
      duration: '90 min',
      description: 'Full grooming package with multiple services',
      image: '⭐',
      popular: true
    }
  ];

  const features = [
    {
      icon: UserGroupIcon,
      title: 'Expert Barbers',
      description: 'Skilled professionals with years of experience'
    },
    {
      icon: TrendingUpIcon,
      title: 'Modern Techniques',
      description: 'Latest styling techniques and equipment'
    },
    {
      icon: AwardIcon,
      title: 'Quality Service',
      description: 'Premium products and exceptional service'
    },
    {
      icon: ClockIcon,
      title: 'Quick Service',
      description: 'Efficient service without compromising quality'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      rating: 5,
      comment: 'Best haircut experience in the city! Professional service and great prices.',
      location: 'Regular Customer'
    },
    {
      name: 'Amit Singh',
      rating: 5,
      comment: 'Amazing beard trim and friendly staff. Highly recommended!',
      location: 'Happy Customer'
    },
    {
      name: 'Vikram Patel',
      rating: 5,
      comment: 'Clean, professional, and affordable. My go-to saloon now.',
      location: 'Loyal Customer'
    }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-red to-red-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white bg-opacity-20 rounded-full p-6">
                <ScissorsIcon className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
              Dreams Saloon
            </h1>
            <p className="text-xl md:text-2xl mb-2 text-red-100">
              Barbershop – Hair Cut & Shaves
            </p>
            <p className="text-lg md:text-xl mb-8 text-red-200">
              Affordable Pricing • Stylish Look • Clean Interface
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/appointments"
                className="bg-white text-primary-red px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg"
              >
                Book Appointment
              </Link>
              <button
                onClick={() => scrollToSection('services')}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-red transition-colors duration-300"
              >
                View Services
              </button>
            </div>

            {/* Contact Info */}
            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center text-red-100">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5" />
                <span>Ramesh: 9963388556</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5" />
                <span>Rambabu: 9666699201</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-black mb-4">
              Why Choose Dreams Saloon?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the difference with our professional services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-red bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary-red" />
                </div>
                <h3 className="text-xl font-semibold text-primary-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-black mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600">
              Professional grooming services for the modern man
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                {service.popular && (
                  <div className="bg-primary-red text-white text-xs px-3 py-1 rounded-full absolute top-4 right-4">
                    Popular
                  </div>
                )}
                
                <div className="p-6">
                  <div className="text-4xl mb-4 text-center">
                    {service.image}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-primary-black mb-2">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm">
                    {service.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-primary-red">
                      ₹{service.price}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {service.duration}
                    </div>
                  </div>
                  
                  <Link
                    to="/appointments"
                    className="w-full btn-primary text-center block"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Special Offer */}
          <div className="mt-12 bg-gradient-to-r from-primary-red to-red-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              🎉 Special Loyalty Offer! 🎉
            </h3>
            <p className="text-lg mb-4">
              Every 5th visit is FREE! Build your loyalty and save money.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircleIcon className="h-5 w-5" />
              <span>No membership fees • Automatic tracking • Great savings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-black mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              Real reviews from satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-red rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-primary-black">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-primary-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Visit Dreams Saloon
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Experience professional grooming in a clean, modern environment with affordable prices.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPinIcon className="h-6 w-6 text-primary-red mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-gray-300">
                      Dreams Saloon<br />
                      [Your Address Here]<br />
                      [City, State, Pincode]
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <PhoneIcon className="h-6 w-6 text-primary-red mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Phone Numbers</h3>
                    <p className="text-gray-300">
                      Ramesh: <a href="tel:9963388556" className="hover:text-primary-red">9963388556</a><br />
                      Rambabu: <a href="tel:9666699201" className="hover:text-primary-red">9666699201</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <ClockIcon className="h-6 w-6 text-primary-red mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Working Hours</h3>
                    <p className="text-gray-300">
                      Monday - Saturday: 9:00 AM - 8:00 PM<br />
                      Sunday: 10:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white bg-opacity-5 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Ready to Look Your Best?</h3>
              
              <div className="space-y-4">
                <Link
                  to="/appointments"
                  className="w-full bg-primary-red hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center block"
                >
                  Book Your Appointment
                </Link>
                
                <a
                  href="tel:9963388556"
                  className="w-full border-2 border-white text-white hover:bg-white hover:text-primary-black font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center block"
                >
                  Call Now
                </a>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-600">
                <p className="text-center text-gray-300 text-sm">
                  Walk-ins welcome! But appointments are recommended for faster service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-black border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <ScissorsIcon className="h-8 w-8 text-primary-red" />
              <span className="text-xl font-bold text-white">Dreams Saloon</span>
            </div>
            <p className="text-gray-400 mb-4">
              Barbershop – Hair Cut & Shaves
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 Dreams Saloon. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;