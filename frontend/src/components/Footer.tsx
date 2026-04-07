import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, ExternalLink } from 'lucide-react';
const logo = '/Logo.jpeg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '#about' },
    { name: 'Programs', href: '#programs' },
    { name: 'Media Centre', href: '/media' },
    { name: 'Events', href: '/events' },
    { name: 'Contact', href: '#contact' }
  ];

  const programs = [
    { name: 'School Feeding', href: '#feeding' },
    { name: 'Nutrition Education', href: '#nutrition' },
    { name: 'Community Outreach', href: '#outreach' },
    { name: 'Farmer Support', href: '#farmers' }
  ];

  const resources = [
    { name: 'Annual Reports', href: '#reports' },
    { name: 'Research & Data', href: '#research' },
    { name: 'Procurement', href: '#procurement' },
    { name: 'Careers', href: '#careers' }
  ];

  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: Facebook, 
      href: 'https://www.facebook.com/p/Ghana-School-Feeding-Programme-100069106004464/',
      color: 'hover:text-blue-600 bg-blue-500',
      bgIcon: 'bg-blue-600'
    },
    { 
      name: 'Twitter', 
      icon: Twitter, 
      href: 'https://twitter.com/GhanaSchoolFeeding',
      color: 'hover:text-blue-400 bg-blue-400',
      bgIcon: 'bg-blue-500'
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      href: 'https://www.instagram.com/ghanaschoolfeedingprogramme',
      color: 'hover:text-pink-500 bg-gradient-to-br from-pink-500 to-purple-500',
      bgIcon: 'bg-gradient-to-br from-pink-600 to-purple-600'
    },
    { 
      name: 'YouTube', 
      icon: Youtube, 
      href: '#',
      color: 'hover:text-red-600 bg-red-500',
      bgIcon: 'bg-red-600'
    }
  ];

  return (
    <footer className="bg-ghana-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Organization Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-2">
              <img
                className="h-14 w-auto mr-3 min-h-[56px] min-w-[56px] object-contain border-2 border-yellow-400 rounded-lg"
                src={logo}
                alt="Ghana School Feeding Programme"
                style={{
                  filter: 'none',
                  opacity: 1,
                  display: 'block',
                  backgroundColor: 'white',
                  padding: '4px'
                }}
              />
              <span className="text-yellow-400 font-bold text-sm leading-tight border-l border-ghana-secondary-700 pl-3">Ghana<br />School Feeding<br />Programme</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-3 text-ghana-neutral-300" />
                <span className="text-sm text-ghana-neutral-200">P.O.BOX 1627 State House, Accra</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-ghana-neutral-300" />
                <span className="text-sm text-ghana-neutral-200">0508563053 / 080068856</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-ghana-neutral-300" />
                <span className="text-sm text-ghana-neutral-200">contact@gsfp@mogcsp.gov.gh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-ghana-neutral-200 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Programs</h3>
            <ul className="space-y-1">
              {programs.map((program) => (
                <li key={program.name}>
                  <a
                    href={program.href}
                    className="text-ghana-neutral-200 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {program.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Connect */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Resources</h3>
            <ul className="space-y-1 mb-3">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.href}
                    className="text-ghana-neutral-200 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social Media Links */}
            <h3 className="text-sm font-semibold mb-2">Connect With Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`w-8 h-8 rounded-lg ${social.bgIcon} text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg`}
                    aria-label={social.name}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-ghana-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-ghana-neutral-200 text-xs mb-2 md:mb-0">
              © {currentYear} Ghana School Feeding Programme. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#privacy" className="text-ghana-neutral-200 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#terms" className="text-ghana-neutral-200 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#accessibility" className="text-ghana-neutral-200 hover:text-white transition-colors duration-200">
                Accessibility
              </a>
              <a
                href="https://www.mogcsp.gov.gh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ghana-neutral-200 hover:text-white transition-colors duration-200 inline-flex items-center"
              >
                Ministry of Gender, Children & Social Protection
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
