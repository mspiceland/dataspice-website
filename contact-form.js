// contact-form.js
const ContactForm = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        phone: '',
        email: '',
        website: ''
    });

    const [errors, setErrors] = React.useState({});
    const [submitStatus, setSubmitStatus] = React.useState(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const validatePhone = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        return /^1?\d{10}$/.test(cleaned);
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateURL = (url) => {
        // If no URL is provided, it's valid (since it's optional)
        if (!url) return true;
        
        // Remove http:// or https:// if present
        const domainToTest = url.replace(/^https?:\/\//, '');
        
        // Basic domain validation: 
        // - Must have at least one dot
        // - Must have something before and after the dot
        // - Can't start or end with a dot or hyphen
        // - Can't have consecutive dots
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
        
        return domainRegex.test(domainToTest);
    };

    const formatPhone = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `(${cleaned.slice(0,3)}) ${cleaned.slice(3)}`;
        return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        
        if (name === 'phone') {
            formattedValue = formatPhone(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        let newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid US phone number';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (formData.website && !validateURL(formData.website)) {
            newErrors.website = 'Please enter a valid website URL (e.g., example.com)';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        // Prepare the website URL for submission by adding https:// if needed
        const websiteUrl = formData.website ? 
            (formData.website.match(/^https?:\/\//) ? formData.website : `https://${formData.website}`) : 
            '';

        const submitData = {
            ...formData,
            website: websiteUrl
        };

        try {
            const response = await fetch('https://hook.us2.make.com/qw3auswq9jn14u3woe8mmtl6zf1w42o7', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData)
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', phone: '', email: '', website: '' });
            } else {
                // Handle specific HTTP status codes
                switch (response.status) {
                    case 404:
                        throw new Error('The webhook endpoint could not be found. The scenario might be deactivated.');
                    case 429:
                        throw new Error('Too many requests. Please try again later.');
                    case 500:
                    case 502:
                    case 503:
                    case 504:
                        throw new Error('There was a server error. Please try again later.');
                    default:
                        throw new Error(`Submission failed with status: ${response.status}`);
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'There was a problem sending your message. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === 'success') {
        return React.createElement('div', {
            className: 'max-w-lg mx-auto p-6 bg-green-50 border border-green-200 rounded-lg text-center'
        },
            React.createElement('p', {
                className: 'text-lg text-green-800'
            }, 'Thank you for submitting your information. Please keep an eye out for an email from us soon!')
        );
    }

    return React.createElement('div', { className: 'max-w-lg mx-auto' },
        (submitStatus === 'error' && errors.submit) && React.createElement('div', {
            className: 'mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'
        },
            React.createElement('p', { className: 'text-red-800' },
                errors.submit
            )
        ),

        React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-6' },
            // Name Field
            React.createElement('div', {},
                React.createElement('label', {
                    htmlFor: 'name',
                    className: 'block text-sm font-medium text-gray-700 mb-1'
                }, 'Name *'),
                React.createElement('input', {
                    type: 'text',
                    id: 'name',
                    name: 'name',
                    value: formData.name,
                    onChange: handleChange,
                    className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dataspice focus:outline-none ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                    }`,
                    placeholder: 'Your full name'
                }),
                errors.name && React.createElement('p', {
                    className: 'mt-1 text-sm text-red-600'
                }, errors.name)
            ),

            // Phone Field
            React.createElement('div', {},
                React.createElement('label', {
                    htmlFor: 'phone',
                    className: 'block text-sm font-medium text-gray-700 mb-1'
                }, 'Phone Number *'),
                React.createElement('input', {
                    type: 'tel',
                    id: 'phone',
                    name: 'phone',
                    value: formData.phone,
                    onChange: handleChange,
                    className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dataspice focus:outline-none ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`,
                    placeholder: '(555) 555-1212'
                }),
                errors.phone && React.createElement('p', {
                    className: 'mt-1 text-sm text-red-600'
                }, errors.phone)
            ),

            // Email Field
            React.createElement('div', {},
                React.createElement('label', {
                    htmlFor: 'email',
                    className: 'block text-sm font-medium text-gray-700 mb-1'
                }, 'Email *'),
                React.createElement('input', {
                    type: 'email',
                    id: 'email',
                    name: 'email',
                    value: formData.email,
                    onChange: handleChange,
                    className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dataspice focus:outline-none ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                    }`,
                    placeholder: 'you@example.com'
                }),
                errors.email && React.createElement('p', {
                    className: 'mt-1 text-sm text-red-600'
                }, errors.email)
            ),

            // Website Field
            React.createElement('div', {},
                React.createElement('label', {
                    htmlFor: 'website',
                    className: 'block text-sm font-medium text-gray-700 mb-1'
                }, 'Website URL'),
                React.createElement('input', {
                    type: 'text',
                    id: 'website',
                    name: 'website',
                    value: formData.website,
                    onChange: handleChange,
                    className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-dataspice focus:outline-none ${
                        errors.website ? 'border-red-500' : 'border-gray-300'
                    }`,
                    placeholder: 'example.com'
                }),
                errors.website && React.createElement('p', {
                    className: 'mt-1 text-sm text-red-600'
                }, errors.website)
            ),

            // Submit Button
            React.createElement('button', {
                type: 'submit',
                disabled: isSubmitting,
                className: `w-full bg-dataspice text-white py-2 px-4 rounded-lg font-semibold
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'} transition`
            }, isSubmitting ? 'Sending...' : 'Send Message')
        )
    );
};

// Render the component
ReactDOM.render(
    React.createElement(ContactForm),
    document.getElementById('contact-form')
);