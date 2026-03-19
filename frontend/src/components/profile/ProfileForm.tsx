"use client";
import React from "react";
import { useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator } from "../ui/breadcrumb";
import { updateProfile } from "@/actions/profile/updateProfile";
import { UserIcon, Calendar, VenusAndMars, Globe, Heart, Users, Briefcase, GraduationCap, Languages, Code } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Profile } from "@/types/Profile";
import type { User } from '@supabase/supabase-js';

const steps = [
  { label: "Personal Details" },
  { label: "Preferred Industries" },
  { label: "Education" },
  { label: "Language Proficiency" },
  { label: "Technical Skills" },
  { label: "Review" },
];

export default function ProfileForm({
  user,
  profile,
  setProfile,
}: {
  user: User;
  profile: Profile;
  setProfile?: (profile: Profile) => void;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSavingState] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [currentEducation, setCurrentEducation] = useState(profile?.current_education ?? "");
  const [preferredIndustries, setPreferredIndustries] = useState(profile?.preferred_industries ?? []);
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth ?? "");
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [nationality, setNationality] = useState(profile?.nationality ?? "");
  const [maritalStatus, setMaritalStatus] = useState(profile?.marital_status ?? "");
  const [race, setRace] = useState(profile?.race ?? "");
  const [languageProficiency, setLanguageProficiency] = useState<string[]>(profile?.language_proficiency ?? []);
  const [technicalSkills, setTechnicalSkills] = useState<string[]>(profile?.technical_skills ?? []);
  const [industryInput, setIndustryInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [technicalSkillInput, setTechnicalSkillInput] = useState("");
  const [interests, setInterests] = useState(profile?.interests ?? "");
  const [fieldOfStudy, setFieldOfStudy] = useState(profile?.field_of_study ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [gpa, setGpa] = useState(profile?.gpa ?? "");
  const [age, setAge] = useState(profile?.age ?? "");

  // Form Redirection
  const handleNext = () => setStep((step) => Math.min(step + 1, steps.length - 1));

  const handleBack = () => setStep((step) => Math.max(step - 1, 0));

  // Handling the Submission 
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSavingState(true);
    try {
      await updateProfile({
        userId: user.id,
        ...profile,
        full_name: fullName,
        current_education: currentEducation,
        preferred_industries: preferredIndustries,
        date_of_birth: dateOfBirth,
        gender,
        nationality,
        marital_status: maritalStatus,
        race,
        language_proficiency: languageProficiency,
        technical_skills: technicalSkills,
        interests,
        field_of_study: fieldOfStudy,
        country,
        gpa: gpa && typeof gpa === "string" ? parseFloat(gpa) : null,
        age: age && typeof age === "string" ? parseInt(age, 10) : null,
      });
      const updatedProfile = {
        ...profile,
        full_name: fullName,
        current_education: currentEducation,
        preferred_industries: preferredIndustries,
        date_of_birth: dateOfBirth,
        gender,
        nationality,
        marital_status: maritalStatus,
        race,
        language_proficiency: languageProficiency,
        technical_skills: technicalSkills,
        interests,
        field_of_study: fieldOfStudy,
        country,
        gpa: gpa && typeof gpa === "string" ? parseFloat(gpa) : null,
        age: age && typeof age === "string" ? parseInt(age, 10) : null,
      };
      if (setProfile) setProfile(updatedProfile);
    } catch (err) {
      // Optionally handle error (e.g., show a toast)
      console.error(err);
    }
    setSavingState(false);
  }
  return (
    <Card className="w-full max-w-3xl rounded-2xl p-10 shadow-2xl bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="mb-2 text-3xl flex items-center gap-2">
          <UserIcon className="text-primary" /> Edit Profile
        </CardTitle>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm">{`Step ${step + 1} of ${steps.length}`}</span>
          <div className="w-2/3 h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            {steps.map((s, idx) => (
              <React.Fragment key={s.label}>
                <BreadcrumbItem>
                  <span
                    className={
                      idx === step
                        ? "font-bold text-primary"
                        : "text-muted-foreground hover:text-primary cursor-pointer"
                    }
                    style={{ cursor: idx !== step ? 'pointer' : 'default' }}
                    onClick={() => idx !== step && setStep(idx)}
                  >
                    {s.label}
                  </span>
                </BreadcrumbItem>
                {idx < steps.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-semibold mb-4 text-primary">
          {steps[step].label}
        </h2>
        <form onSubmit={handleSave} className="space-y-6">
          {step === 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" /> Full Name
                </span>
                <Input
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Date of Birth
                </span>
                <Input
                  type="date"
                  className="mt-1"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <VenusAndMars className="w-4 h-4 text-primary" /> Gender
                </span>
                <select
                  className="mt-1 block w-full border rounded p-2"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Nationality
                </span>
                <select
                  className="mt-1 block w-full border rounded p-2"
                  value={nationality}
                  onChange={e => setNationality(e.target.value)}
                >
                  <option value="">-- select one --</option>
                  <option value="afghan">Afghan</option>
                  <option value="albanian">Albanian</option>
                  <option value="algerian">Algerian</option>
                  <option value="american">American</option>
                  <option value="andorran">Andorran</option>
                  <option value="angolan">Angolan</option>
                  <option value="antiguans">Antiguans</option>
                  <option value="argentinean">Argentinean</option>
                  <option value="armenian">Armenian</option>
                  <option value="australian">Australian</option>
                  <option value="austrian">Austrian</option>
                  <option value="azerbaijani">Azerbaijani</option>
                  <option value="bahamian">Bahamian</option>
                  <option value="bahraini">Bahraini</option>
                  <option value="bangladeshi">Bangladeshi</option>
                  <option value="barbadian">Barbadian</option>
                  <option value="barbudans">Barbudans</option>
                  <option value="batswana">Batswana</option>
                  <option value="belarusian">Belarusian</option>
                  <option value="belgian">Belgian</option>
                  <option value="belizean">Belizean</option>
                  <option value="beninese">Beninese</option>
                  <option value="bhutanese">Bhutanese</option>
                  <option value="bolivian">Bolivian</option>
                  <option value="bosnian">Bosnian</option>
                  <option value="brazilian">Brazilian</option>
                  <option value="british">British</option>
                  <option value="bruneian">Bruneian</option>
                  <option value="bulgarian">Bulgarian</option>
                  <option value="burkinabe">Burkinabe</option>
                  <option value="burmese">Burmese</option>
                  <option value="burundian">Burundian</option>
                  <option value="cambodian">Cambodian</option>
                  <option value="cameroonian">Cameroonian</option>
                  <option value="canadian">Canadian</option>
                  <option value="cape verdean">Cape Verdean</option>
                  <option value="central african">Central African</option>
                  <option value="chadian">Chadian</option>
                  <option value="chilean">Chilean</option>
                  <option value="chinese">Chinese</option>
                  <option value="colombian">Colombian</option>
                  <option value="comoran">Comoran</option>
                  <option value="congolese">Congolese</option>
                  <option value="costa rican">Costa Rican</option>
                  <option value="croatian">Croatian</option>
                  <option value="cuban">Cuban</option>
                  <option value="cypriot">Cypriot</option>
                  <option value="czech">Czech</option>
                  <option value="danish">Danish</option>
                  <option value="djibouti">Djibouti</option>
                  <option value="dominican">Dominican</option>
                  <option value="dutch">Dutch</option>
                  <option value="east timorese">East Timorese</option>
                  <option value="ecuadorean">Ecuadorean</option>
                  <option value="egyptian">Egyptian</option>
                  <option value="emirian">Emirian</option>
                  <option value="equatorial guinean">Equatorial Guinean</option>
                  <option value="eritrean">Eritrean</option>
                  <option value="estonian">Estonian</option>
                  <option value="ethiopian">Ethiopian</option>
                  <option value="fijian">Fijian</option>
                  <option value="filipino">Filipino</option>
                  <option value="finnish">Finnish</option>
                  <option value="french">French</option>
                  <option value="gabonese">Gabonese</option>
                  <option value="gambian">Gambian</option>
                  <option value="georgian">Georgian</option>
                  <option value="german">German</option>
                  <option value="ghanaian">Ghanaian</option>
                  <option value="greek">Greek</option>
                  <option value="grenadian">Grenadian</option>
                  <option value="guatemalan">Guatemalan</option>
                  <option value="guinea-bissauan">Guinea-Bissauan</option>
                  <option value="guinean">Guinean</option>
                  <option value="guyanese">Guyanese</option>
                  <option value="haitian">Haitian</option>
                  <option value="herzegovinian">Herzegovinian</option>
                  <option value="honduran">Honduran</option>
                  <option value="hungarian">Hungarian</option>
                  <option value="icelander">Icelander</option>
                  <option value="indian">Indian</option>
                  <option value="indonesian">Indonesian</option>
                  <option value="iranian">Iranian</option>
                  <option value="iraqi">Iraqi</option>
                  <option value="irish">Irish</option>
                  <option value="israeli">Israeli</option>
                  <option value="italian">Italian</option>
                  <option value="ivorian">Ivorian</option>
                  <option value="jamaican">Jamaican</option>
                  <option value="japanese">Japanese</option>
                  <option value="jordanian">Jordanian</option>
                  <option value="kazakhstani">Kazakhstani</option>
                  <option value="kenyan">Kenyan</option>
                  <option value="kittian and nevisian">Kittian and Nevisian</option>
                  <option value="kuwaiti">Kuwaiti</option>
                  <option value="kyrgyz">Kyrgyz</option>
                  <option value="laotian">Laotian</option>
                  <option value="latvian">Latvian</option>
                  <option value="lebanese">Lebanese</option>
                  <option value="liberian">Liberian</option>
                  <option value="libyan">Libyan</option>
                  <option value="liechtensteiner">Liechtensteiner</option>
                  <option value="lithuanian">Lithuanian</option>
                  <option value="luxembourger">Luxembourger</option>
                  <option value="macedonian">Macedonian</option>
                  <option value="malagasy">Malagasy</option>
                  <option value="malawian">Malawian</option>
                  <option value="malaysian">Malaysian</option>
                  <option value="maldivan">Maldivan</option>
                  <option value="malian">Malian</option>
                  <option value="maltese">Maltese</option>
                  <option value="marshallese">Marshallese</option>
                  <option value="mauritanian">Mauritanian</option>
                  <option value="mauritian">Mauritian</option>
                  <option value="mexican">Mexican</option>
                  <option value="micronesian">Micronesian</option>
                  <option value="moldovan">Moldovan</option>
                  <option value="monacan">Monacan</option>
                  <option value="mongolian">Mongolian</option>
                  <option value="moroccan">Moroccan</option>
                  <option value="mosotho">Mosotho</option>
                  <option value="motswana">Motswana</option>
                  <option value="mozambican">Mozambican</option>
                  <option value="namibian">Namibian</option>
                  <option value="nauruan">Nauruan</option>
                  <option value="nepalese">Nepalese</option>
                  <option value="new zealander">New Zealander</option>
                  <option value="ni-vanuatu">Ni-Vanuatu</option>
                  <option value="nicaraguan">Nicaraguan</option>
                  <option value="nigerien">Nigerien</option>
                  <option value="north korean">North Korean</option>
                  <option value="northern irish">Northern Irish</option>
                  <option value="norwegian">Norwegian</option>
                  <option value="omani">Omani</option>
                  <option value="pakistani">Pakistani</option>
                  <option value="palauan">Palauan</option>
                  <option value="panamanian">Panamanian</option>
                  <option value="papua new guinean">Papua New Guinean</option>
                  <option value="paraguayan">Paraguayan</option>
                  <option value="peruvian">Peruvian</option>
                  <option value="polish">Polish</option>
                  <option value="portuguese">Portuguese</option>
                  <option value="qatari">Qatari</option>
                  <option value="romanian">Romanian</option>
                  <option value="russian">Russian</option>
                  <option value="rwandan">Rwandan</option>
                  <option value="saint lucian">Saint Lucian</option>
                  <option value="salvadoran">Salvadoran</option>
                  <option value="samoan">Samoan</option>
                  <option value="san marinese">San Marinese</option>
                  <option value="sao tomean">Sao Tomean</option>
                  <option value="saudi">Saudi</option>
                  <option value="scottish">Scottish</option>
                  <option value="senegalese">Senegalese</option>
                  <option value="serbian">Serbian</option>
                  <option value="seychellois">Seychellois</option>
                  <option value="sierra leonean">Sierra Leonean</option>
                  <option value="singaporean">Singaporean</option>
                  <option value="slovakian">Slovakian</option>
                  <option value="slovenian">Slovenian</option>
                  <option value="solomon islander">Solomon Islander</option>
                  <option value="somali">Somali</option>
                  <option value="south african">South African</option>
                  <option value="south korean">South Korean</option>
                  <option value="spanish">Spanish</option>
                  <option value="sri lankan">Sri Lankan</option>
                  <option value="sudanese">Sudanese</option>
                  <option value="surinamer">Surinamer</option>
                  <option value="swazi">Swazi</option>
                  <option value="swedish">Swedish</option>
                  <option value="swiss">Swiss</option>
                  <option value="syrian">Syrian</option>
                  <option value="taiwanese">Taiwanese</option>
                  <option value="tajik">Tajik</option>
                  <option value="tanzanian">Tanzanian</option>
                  <option value="thai">Thai</option>
                  <option value="togolese">Togolese</option>
                  <option value="tongan">Tongan</option>
                  <option value="trinidadian or tobagonian">Trinidadian or Tobagonian</option>
                  <option value="tunisian">Tunisian</option>
                  <option value="turkish">Turkish</option>
                  <option value="tuvaluan">Tuvaluan</option>
                  <option value="ugandan">Ugandan</option>
                  <option value="ukrainian">Ukrainian</option>
                  <option value="uruguayan">Uruguayan</option>
                  <option value="uzbekistani">Uzbekistani</option>
                  <option value="venezuelan">Venezuelan</option>
                  <option value="vietnamese">Vietnamese</option>
                  <option value="welsh">Welsh</option>
                  <option value="yemenite">Yemenite</option>
                  <option value="zambian">Zambian</option>
                  <option value="zimbabwean">Zimbabwean</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" /> Marital Status
                </span>
                <select
                  className="mt-1 block w-full border rounded p-2"
                  value={maritalStatus}
                  onChange={e => setMaritalStatus(e.target.value)}
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Race
                </span>
                <select
                  className="mt-1 block w-full border rounded p-2"
                  value={race}
                  onChange={e => setRace(e.target.value)}
                >
                  <option value="">Select Race</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Malay">Malay</option>
                  <option value="Indian">Indian</option>
                  <option value="Eurasian">Eurasian</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Interests</span>
                <Input
                  placeholder="e.g. machine learning, AI, data science"
                  value={interests}
                  onChange={e => setInterests(e.target.value)}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Field of Study</span>
                <Input
                  placeholder="e.g. Computer Science"
                  value={fieldOfStudy}
                  onChange={e => setFieldOfStudy(e.target.value)}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Country</span>
                <Input
                  placeholder="e.g. United States"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">GPA</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 3.8"
                  value={gpa}
                  onChange={e => setGpa(e.target.value)}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Age</span>
                <Input
                  type="number"
                  placeholder="e.g. 20"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="mt-1"
                />
              </label>
            </div>
          )}
          {step === 1 && (
            <div>
              <label className="block">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Preferred Industries
                </span>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {preferredIndustries.map((industry, idx) => (
                    <span
                      key={industry}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {industry}
                      <button
                        type="button"
                        className="ml-2 text-blue-500 hover:text-red-500"
                        onClick={() =>
                          setPreferredIndustries(preferredIndustries.filter((_, i) => i !== idx))
                        }
                        aria-label={`Remove ${industry}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  className="mt-1 block w-full border rounded p-2"
                  placeholder="Eg. Finance, Technology, etc. (Type and press Enter)"
                  value={industryInput}
                  onChange={e => setIndustryInput(e.target.value)}
                  onKeyDown={e => {
                    if (
                      (e.key === "Enter" || e.key === "," || e.key === "Tab") &&
                      industryInput.trim()
                    ) {
                      e.preventDefault();
                      if (
                        !preferredIndustries.includes(industryInput.trim())
                      ) {
                        setPreferredIndustries([...preferredIndustries, industryInput.trim()]);
                      }
                      setIndustryInput("");
                    }
                  }}
                />
              </label>
            </div>
          )}
          {step === 2 && (
            <div>
              <label className="block">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" /> Current Education
                </span>
                <Input
                  className="mt-1 block w-full border border-gray-300 rounded px-4 py-2"
                  placeholder="Eg. Bachelor of Science in Computer Science"
                  value={currentEducation}
                  onChange={e => setCurrentEducation(e.target.value)}
                />
              </label>
            </div>
          )}
          {step === 3 && (
            <div>
              <label className="block">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-primary" /> Language Proficiency (Speak & Write Confidently)
                </span>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {languageProficiency.map((lang, idx) => (
                    <span
                      key={lang}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {lang}
                      <button
                        type="button"
                        className="ml-2 text-green-500 hover:text-red-500"
                        onClick={() =>
                          setLanguageProficiency(languageProficiency.filter((_, i) => i !== idx))
                        }
                        aria-label={`Remove ${lang}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  className="mt-1 block w-full border rounded p-2"
                  placeholder="Eg. English, Chinese, etc. (Type and press Enter)"
                  value={languageInput}
                  onChange={e => setLanguageInput(e.target.value)}
                  onKeyDown={e => {
                    if (
                      (e.key === "Enter" || e.key === "," || e.key === "Tab") &&
                      languageInput.trim()
                    ) {
                      e.preventDefault();
                      if (
                        !languageProficiency.includes(languageInput.trim())
                      ) {
                        setLanguageProficiency([...languageProficiency, languageInput.trim()]);
                      }
                      setLanguageInput("");
                    }
                  }}
                />
              </label>
            </div>
          )}
          {step === 4 && (
            <div>
              <label className="block">
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" /> Technical Skills
                </span>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {technicalSkills.map((skill, idx) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        className="ml-2 text-blue-500 hover:text-red-500"
                        onClick={() =>
                          setTechnicalSkills(technicalSkills.filter((_, i) => i !== idx))
                        }
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <Input
                  className="mt-1 block w-full border rounded p-2"
                  placeholder="Eg. Python, Java, etc. (Type and press Enter)"
                  value={technicalSkillInput}
                  onChange={e => setTechnicalSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (
                      (e.key === "Enter" || e.key === "," || e.key === "Tab") &&
                      technicalSkillInput.trim()
                    ) {
                      e.preventDefault();
                      if (
                        !technicalSkills.includes(technicalSkillInput.trim())
                      ) {
                        setTechnicalSkills([...technicalSkills, technicalSkillInput.trim()]);
                      }
                      setTechnicalSkillInput("");
                    }
                  }}
                />
              </label>
            </div>
          )}
          {step === 5 && (
            <div>
              <div><strong>Name:</strong> {fullName}</div>
              <div><strong>Date of Birth:</strong> {dateOfBirth}</div>
              <div><strong>Gender:</strong> {gender}</div>
              <div><strong>Nationality:</strong> {nationality}</div>
              <div><strong>Marital Status:</strong> {maritalStatus}</div>
              <div><strong>Race:</strong> {race}</div>
              <div><strong>Current Education:</strong> {currentEducation}</div>
              <div><strong>Preferred Industries:</strong> {preferredIndustries.join(", ")}</div>
              <div><strong>Language Proficiency:</strong> {languageProficiency.join(", ")}</div>
              <div><strong>Technical Skills:</strong> {technicalSkills.join(", ")}</div>
              <div><strong>Interests:</strong> {interests}</div>
              <div><strong>Field of Study:</strong> {fieldOfStudy}</div>
              <div><strong>Country:</strong> {country}</div>
              <div><strong>GPA:</strong> {gpa}</div>
              <div><strong>Age:</strong> {age}</div>
            </div>
          )}
          <div className="flex justify-between mt-4">
            <Button type="button" onClick={handleBack} disabled={step === 0} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={handleNext} variant="default">
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
