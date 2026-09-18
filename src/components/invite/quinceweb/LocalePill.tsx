"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";

export default function LocalePill({ locale }: { locale: Locale }) {
  return (
    <div className="qw-locale">
      <LanguageSwitcher locale={locale} variant="invite" />
    </div>
  );
}
