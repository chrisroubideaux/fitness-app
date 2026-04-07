// components/about/ServicesSection.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  FaDumbbell,
  FaUtensils,
  FaCalendarAlt,
  FaHeartbeat,
} from 'react-icons/fa';

const services = [
  {
    icon: <FaDumbbell />,
    title: 'Personalized Workouts',
    description:
      'Custom training plans built around your goals, experience level, and weekly routine.',
  },
  {
    icon: <FaUtensils />,
    title: 'Meal Guidance',
    description:
      'Simple nutrition support, meal ideas, and sustainable habits that fit real life.',
  },
  {
    icon: <FaCalendarAlt />,
    title: 'Flexible Scheduling',
    description:
      'Train at home, in the gym, mornings or evenings — your plan adapts to your schedule.',
  },
  {
    icon: <FaHeartbeat />,
    title: 'Mind & Body Wellness',
    description:
      'Support beyond workouts with mobility, recovery, breathwork, and consistency coaching.',
  },
];

export default function ServicesSection() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      style={{
        width: '100%',
        padding: isDesktop ? '6rem 2rem 6rem 7.25rem' : '4.5rem 1rem',
        background:
          'linear-gradient(180deg, #f8fafc 0%, #f3f4f6 35%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-80px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(139,92,246,0.10)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-120px',
          left: isDesktop ? '90px' : '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'rgba(236,72,153,0.08)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          className="text-center"
          style={{
            maxWidth: '720px',
            margin: '0 auto 3.5rem auto',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '0.45rem 0.9rem',
              borderRadius: '999px',
              background: 'rgba(139,92,246,0.10)',
              color: '#8b5cf6',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Our Services
          </span>

          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              color: '#111827',
            }}
          >
            Coaching designed for real life and real results
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.75,
              color: '#6b7280',
              margin: 0,
            }}
          >
            Empowering your fitness journey with personalized support, smart
            structure, and flexible coaching that fits your lifestyle.
          </p>
        </div>

        <div className="row g-4 align-items-stretch">
          <div className="col-12 col-xl-7">
            <div className="row g-4">
              {services.map((service) => (
                <div className="col-12 col-sm-6" key={service.title}>
                  <div
                    style={{
                      height: '100%',
                      padding: '1.5rem',
                      borderRadius: '24px',
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
                      border: '1px solid rgba(139,92,246,0.10)',
                      boxShadow:
                        '0 10px 30px rgba(15,23,42,0.07), 0 0 0 1px rgba(255,255,255,0.4) inset',
                    }}
                  >
                    <div
                      style={{
                        width: '58px',
                        height: '58px',
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.14))',
                        color: '#8b5cf6',
                        fontSize: '1.35rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {service.icon}
                    </div>

                    <h3
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#111827',
                        marginBottom: '0.7rem',
                      }}
                    >
                      {service.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: '#6b7280',
                        lineHeight: 1.7,
                        fontSize: '0.96rem',
                      }}
                    >
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div
              style={{
                height: '100%',
                padding: isDesktop ? '2.2rem' : '1.5rem',
                borderRadius: '28px',
                background:
                  'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(31,41,55,0.92))',
                boxShadow: '0 18px 45px rgba(15,23,42,0.16)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  color: '#c084fc',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                What We Offer
              </span>

              <h3
                style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem',
                }}
              >
                A more complete approach to training and wellness
              </h3>

              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.85,
                  color: 'rgba(255,255,255,0.80)',
                  marginBottom: '1rem',
                }}
              >
                Whether you want to lose weight, build muscle, improve energy,
                or feel more confident in your body, Lena’s coaching is built to
                support your full transformation.
              </p>

              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.85,
                  color: 'rgba(255,255,255,0.80)',
                  marginBottom: '1.5rem',
                }}
              >
                From training plans and nutrition guidance to accountability and
                recovery support, everything is designed to help you progress at
                a pace that feels sustainable and strong.
              </p>

              <div className="row g-3">
                <div className="col-6">
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '18px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: '#fff',
                      }}
                    >
                      1:1
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.72)',
                      }}
                    >
                      Personalized support
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '18px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: '#fff',
                      }}
                    >
                      Flexible
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.72)',
                      }}
                    >
                      Built around your life
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '3rem',
            padding: isDesktop ? '1.5rem 1.75rem' : '1.25rem',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(139,92,246,0.08)',
            boxShadow: '0 12px 35px rgba(15,23,42,0.05)',
          }}
        >
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-8">
              <h4
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Start with a plan that actually fits your life
              </h4>
              <p
                style={{
                  margin: '0.5rem 0 0 0',
                  color: '#6b7280',
                  lineHeight: 1.7,
                }}
              >
                Training, nutrition, recovery, and accountability — all designed
                to help you build momentum without burning out.
              </p>
            </div>

            <div className="col-12 col-lg-4 text-lg-end">
              <a
                href="/plans"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.95rem 1.35rem',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                  boxShadow: '0 12px 30px rgba(139,92,246,0.22)',
                }}
              >
                Explore Plans
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


{/*

// components/about/ServicesSection.tsx
'use client';

import {
  FaDumbbell,
  FaUtensils,
  FaCalendarAlt,
  FaHeartbeat,
} from 'react-icons/fa';

const services = [
  {
    icon: <FaDumbbell />,
    title: 'Personalized Workouts',
    description:
      'Custom training plans built around your goals, experience level, and weekly routine.',
  },
  {
    icon: <FaUtensils />,
    title: 'Meal Guidance',
    description:
      'Simple nutrition support, meal ideas, and sustainable habits that fit real life.',
  },
  {
    icon: <FaCalendarAlt />,
    title: 'Flexible Scheduling',
    description:
      'Train at home, in the gym, mornings or evenings — your plan adapts to your schedule.',
  },
  {
    icon: <FaHeartbeat />,
    title: 'Mind & Body Wellness',
    description:
      'Support beyond workouts with mobility, recovery, breathwork, and consistency coaching.',
  },
];

export default function ServicesSection() {
  return (
    <section
      style={{
        width: '100%',
        padding: '5rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
        }}
      >
        <div
          className="text-center"
          style={{
            maxWidth: '700px',
            margin: '0 auto 3.5rem auto',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '0.45rem 0.9rem',
              borderRadius: '999px',
              background: 'rgba(139,92,246,0.10)',
              color: '#8b5cf6',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Our Services
          </span>

          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              color: '#111827',
            }}
          >
            Coaching designed for real life and real results
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.75,
              color: '#6b7280',
              margin: 0,
            }}
          >
            Empowering your fitness journey with personalized support, smart
            structure, and flexible coaching that fits your lifestyle.
          </p>
        </div>

        <div className="row g-4 align-items-stretch">
          <div className="col-12 col-xl-7">
            <div className="row g-4">
              {services.map((service) => (
                <div className="col-12 col-sm-6" key={service.title}>
                  <div
                    style={{
                      height: '100%',
                      padding: '1.5rem',
                      borderRadius: '24px',
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
                      border: '1px solid rgba(139,92,246,0.10)',
                      boxShadow:
                        '0 10px 30px rgba(15,23,42,0.07), 0 0 0 1px rgba(255,255,255,0.4) inset',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '58px',
                        height: '58px',
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(236,72,153,0.14))',
                        color: '#8b5cf6',
                        fontSize: '1.35rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {service.icon}
                    </div>

                    <h3
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#111827',
                        marginBottom: '0.7rem',
                      }}
                    >
                      {service.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: '#6b7280',
                        lineHeight: 1.7,
                        fontSize: '0.96rem',
                      }}
                    >
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div
              style={{
                height: '100%',
                padding: '2rem',
                borderRadius: '28px',
                background:
                  'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(31,41,55,0.92))',
                boxShadow: '0 18px 45px rgba(15,23,42,0.16)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  color: '#c084fc',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                What We Offer
              </span>

              <h3
                style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  marginBottom: '1.25rem',
                }}
              >
                A more complete approach to training and wellness
              </h3>

              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.85,
                  color: 'rgba(255,255,255,0.80)',
                  marginBottom: '1rem',
                }}
              >
                Whether you want to lose weight, build muscle, improve energy,
                or feel more confident in your body, Lena’s coaching is built to
                support your full transformation.
              </p>

              <p
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.85,
                  color: 'rgba(255,255,255,0.80)',
                  marginBottom: '1.5rem',
                }}
              >
                From training plans and nutrition guidance to accountability and
                recovery support, everything is designed to help you progress at
                a pace that feels sustainable and strong.
              </p>

              <div className="row g-3">
                <div className="col-6">
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '18px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: '#fff',
                      }}
                    >
                      1:1
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.72)',
                      }}
                    >
                      Personalized support
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '18px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: '#fff',
                      }}
                    >
                      Flexible
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.72)',
                      }}
                    >
                      Built around your life
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



*/}