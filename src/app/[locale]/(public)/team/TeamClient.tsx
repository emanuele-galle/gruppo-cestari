'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import {
  Users,
  Linkedin,
  Mail,
  ArrowRight,
  Sparkles,
  Award,
  Globe,
  Building2,
} from 'lucide-react';

interface TeamMember {
  id: string;
  nameKey: string;
  roleKey: string;
  descriptionKey: string;
  image: string;
  linkedin?: string;
  email?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    nameKey: 'members.member1.name',
    roleKey: 'members.member1.role',
    descriptionKey: 'members.member1.description',
    image: '/images/team/founder.jpg',
    linkedin: 'https://linkedin.com/in/alfredocestari',
    email: 'a.cestari@gruppocestari.com',
  },
  {
    id: '2',
    nameKey: 'members.member2.name',
    roleKey: 'members.member2.role',
    descriptionKey: 'members.member2.description',
    image: '/images/team/ceo.jpg',
    linkedin: 'https://linkedin.com/in/esempio',
    email: 'ceo@gruppocestari.com',
  },
  {
    id: '3',
    nameKey: 'members.member3.name',
    roleKey: 'members.member3.role',
    descriptionKey: 'members.member3.description',
    image: '/images/team/cfo.jpg',
    email: 'cfo@gruppocestari.com',
  },
  {
    id: '4',
    nameKey: 'members.member4.name',
    roleKey: 'members.member4.role',
    descriptionKey: 'members.member4.description',
    image: '/images/team/director-energy.jpg',
    linkedin: 'https://linkedin.com/in/esempio',
  },
  {
    id: '5',
    nameKey: 'members.member5.name',
    roleKey: 'members.member5.role',
    descriptionKey: 'members.member5.description',
    image: '/images/team/director-cooperation.jpg',
    linkedin: 'https://linkedin.com/in/esempio',
  },
  {
    id: '6',
    nameKey: 'members.member6.name',
    roleKey: 'members.member6.role',
    descriptionKey: 'members.member6.description',
    image: '/images/team/director-finance.jpg',
    email: 'finance@gruppocestari.com',
  },
];

const stats = [
  { icon: Users, valueKey: 'stats.employees', labelKey: 'stats.employeesLabel' },
  { icon: Globe, valueKey: 'stats.countries', labelKey: 'stats.countriesLabel' },
  { icon: Award, valueKey: 'stats.experience', labelKey: 'stats.experienceLabel' },
  { icon: Building2, valueKey: 'stats.companies', labelKey: 'stats.companiesLabel' },
];

export function TeamClient() {
  const t = useTranslations('team');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/90 to-slate-900" />

        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/30 blur-[100px]"
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6"
            >
              <Users className="w-4 h-4" />
              {t('hero.badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-6xl font-bold text-white mb-6"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/70"
            >
              {t('hero.subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.valueKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {t(stat.valueKey)}
                  </div>
                  <div className="text-sm text-slate-500">{t(stat.labelKey)}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t('grid.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('grid.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={t(member.nameKey)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Fallback */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white/80">
                      {t(member.nameKey)
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Social links */}
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center text-slate-700 hover:text-[#0077B5] transition-colors"
                        aria-label={`LinkedIn di ${t(member.nameKey)}`}
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="w-10 h-10 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center text-slate-700 hover:text-primary transition-colors"
                        aria-label={`Email a ${t(member.nameKey)}`}
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {t(member.nameKey)}
                  </h3>
                  <p className="text-primary font-medium mb-3">{t(member.roleKey)}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {t(member.descriptionKey)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t('cta.badge')}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-slate-600 mb-8">{t('cta.subtitle')}</p>
            <Link
              href="/contatti"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              {t('cta.button')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
