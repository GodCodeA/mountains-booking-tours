import { ChevronDown } from "lucide-react";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const DEFAULT_COUNTRY: CountryCode = "KG";

function flag(country: CountryCode) {
  return String.fromCodePoint(...country.split("").map((letter) => 127397 + letter.charCodeAt(0)));
}

function countryName(country: CountryCode, language: "en" | "ru" | "ky") {
  try {
    return new Intl.DisplayNames([language === "ky" ? "ky-KG" : language], { type: "region" }).of(
      country,
    );
  } catch {
    return country;
  }
}

type PhoneInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  language: "en" | "ru" | "ky";
  countryLabel: string;
  placeholder: string;
  "aria-invalid"?: boolean | undefined;
  "aria-describedby"?: string | undefined;
  className?: string | undefined;
};

/** Stores an E.164 number while showing a country flag/code and national digits. */
export function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  language,
  countryLabel,
  placeholder,
  className,
  ...aria
}: PhoneInputProps) {
  const detectedCountry = parsePhoneNumberFromString(value)?.country;
  const [country, setCountry] = useState<CountryCode>(detectedCountry ?? DEFAULT_COUNTRY);

  useEffect(() => {
    if (detectedCountry) setCountry(detectedCountry);
  }, [detectedCountry]);

  const countries = useMemo(
    () =>
      getCountries()
        .map((code) => ({ code, name: countryName(code, language) ?? code }))
        .sort((a, b) => a.name.localeCompare(b.name, language)),
    [language],
  );

  const callingCode = getCountryCallingCode(country);
  const digits = value.replace(/\D/g, "");
  const nationalValue = digits.startsWith(callingCode) ? digits.slice(callingCode.length) : digits;

  function selectCountry(nextCountry: CountryCode) {
    setCountry(nextCountry);
    if (!digits) return;

    const currentNumber = parsePhoneNumberFromString(value)?.nationalNumber ?? nationalValue;
    onChange(`+${getCountryCallingCode(nextCountry)}${currentNumber}`);
  }

  function changeNumber(rawValue: string) {
    const raw = rawValue.trim();
    const numberDigits = raw.replace(/\D/g, "").slice(0, 15);
    if (!numberDigits) {
      onChange("");
      return;
    }

    if (raw.startsWith("+")) {
      const internationalValue = `+${numberDigits}`;
      const detected = parsePhoneNumberFromString(internationalValue)?.country;
      if (detected) setCountry(detected);
      onChange(internationalValue);
      return;
    }

    onChange(`+${callingCode}${numberDigits}`);
  }

  return (
    <div
      className={cn(
        "mt-1.5 flex h-9 w-full overflow-hidden rounded-md border border-input bg-transparent shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      <label className="relative flex shrink-0 items-center border-r border-input bg-secondary/35">
        <span className="sr-only">{countryLabel}</span>
        <span
          aria-hidden="true"
          className="pointer-events-none flex items-center gap-1 px-2 text-sm"
        >
          {flag(country)} <span className="text-muted-foreground">+{callingCode}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
        <select
          value={country}
          onChange={(event) => selectCountry(event.target.value as CountryCode)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label={countryLabel}
        >
          {countries.map(({ code, name }) => (
            <option key={code} value={code}>
              {flag(code)} +{getCountryCallingCode(code)} — {name}
            </option>
          ))}
        </select>
      </label>
      <input
        id={id}
        value={nationalValue}
        onChange={(event) => changeNumber(event.target.value)}
        onBlur={onBlur}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground md:text-sm"
        {...aria}
      />
    </div>
  );
}
