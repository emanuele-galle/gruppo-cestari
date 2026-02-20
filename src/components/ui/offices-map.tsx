'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink, Navigation, Building2 } from 'lucide-react';

interface Office {
  city: string;
  address: string;
  isHQ?: boolean;
  flag: string;
  country: string;
}

const offices: Office[] = [
  {
    city: 'Salerno',
    address: 'Via Don Minzoni, 1 – 84084 Fisciano (SA), Italia',
    isHQ: true,
    flag: '🇮🇹',
    country: 'Italia',
  },
  {
    city: 'Napoli',
    address: 'Centro Direzionale Isola A5 – 80143 Napoli (NA), Italia',
    flag: '🇮🇹',
    country: 'Italia',
  },
  {
    city: 'Milano',
    address: 'Corso Sempione 32/B – 20154 Milano, Italia',
    flag: '🇮🇹',
    country: 'Italia',
  },
  {
    city: 'Roma',
    address: 'Via Ludovisi 35 – 00187 Roma, Italia',
    flag: '🇮🇹',
    country: 'Italia',
  },
  {
    city: 'Moliterno',
    address: 'Via Amendola 170 – 85047 Moliterno (PZ), Italia',
    flag: '🇮🇹',
    country: 'Italia',
  },
  {
    city: 'Bruxelles',
    address: 'Rue Belliard 20 – 140 – 1040 Bruxelles, Belgio',
    flag: '🇧🇪',
    country: 'Belgio',
  },
];

interface OfficesMapProps {
  title?: string;
  subtitle?: string;
}

export function OfficesMap({ title, subtitle }: OfficesMapProps) {
  const [selectedOffice, setSelectedOffice] = useState<Office>(offices[0]);

  const getGoogleMapsUrl = (office: Office) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}`;
  };

  const getDirectionsUrl = (office: Office) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(office.address)}`;
  };

  // Google Maps embed URL
  const getEmbedUrl = (office: Office) => {
    const query = encodeURIComponent(office.address);
    return `https://www.google.com/maps?q=${query}&output=embed`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="grid lg:grid-cols-3">
        {/* Office List */}
        <div className="lg:col-span-1 p-6 bg-slate-50 border-r border-slate-100">
          {title && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
          )}

          <div className="space-y-3">
            {offices.map((office) => (
              <motion.button
                key={office.city}
                onClick={() => setSelectedOffice(office)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedOffice.city === office.city
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white hover:bg-slate-100 border border-slate-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{office.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${selectedOffice.city === office.city ? 'text-white' : 'text-slate-800'}`}>
                        {office.city}
                      </span>
                      {office.isHQ && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          selectedOffice.city === office.city
                            ? 'bg-white/20 text-white'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          HQ
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${
                      selectedOffice.city === office.city ? 'text-white/80' : 'text-slate-500'
                    }`}>
                      {office.address}
                    </p>
                  </div>
                  <MapPin className={`w-5 h-5 flex-shrink-0 ${
                    selectedOffice.city === office.city ? 'text-white' : 'text-slate-400'
                  }`} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-2 relative">
          <div className="aspect-[4/3] lg:aspect-auto lg:h-full min-h-[400px] relative bg-slate-100">
            {/* Google Maps Embed */}
            <iframe
              key={selectedOffice.city}
              src={getEmbedUrl(selectedOffice)}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Mappa ${selectedOffice.city}`}
              allowFullScreen
            />

            {/* Info overlay */}
            <motion.div
              key={`info-${selectedOffice.city}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:max-w-sm z-10"
            >
              <div className="bg-white rounded-xl shadow-xl p-4 border border-slate-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {selectedOffice.isHQ ? (
                      <Building2 className="w-5 h-5 text-primary" />
                    ) : (
                      <MapPin className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800">
                      {selectedOffice.city}
                      {selectedOffice.isHQ && (
                        <span className="ml-2 text-xs font-normal text-primary">(Sede Centrale)</span>
                      )}
                    </h4>
                    <p className="text-sm text-slate-500 truncate">{selectedOffice.address}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={getGoogleMapsUrl(selectedOffice)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Apri in Maps
                  </a>
                  <a
                    href={getDirectionsUrl(selectedOffice)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Indicazioni
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
