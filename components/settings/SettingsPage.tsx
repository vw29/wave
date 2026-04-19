"use client";

import { useState } from "react";
import EmailCard from "./EmailCard";
import TwoFactorCard from "./TwoFactorCard";
import ChangePasswordCard from "./ChangePasswordCard";
import BlockListCard from "./BlockListCard";
import DeactivateSection from "./DeactivateSection";
import ChangeEmailModal from "./ChangeEmailModal";

interface SettingsPageProps {
  email: string;
  isTwoFactorActivated: boolean;
}

export default function SettingsPage({
  email: initialEmail,
  isTwoFactorActivated,
}: SettingsPageProps) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail);

  const handleEmailUpdate = (newEmail: string) => {
    setEmail(newEmail);
    setIsEmailModalOpen(false);
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Security &amp; Account
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Manage your account security, authentication settings, and password.
        </p>
      </header>

      {/* Cards */}
      <div className="space-y-5">
        <EmailCard
          email={email}
          onChangeClick={() => setIsEmailModalOpen(true)}
        />
        <TwoFactorCard initialEnabled={isTwoFactorActivated} />
        <ChangePasswordCard isTwoFactorActivated={isTwoFactorActivated} />
        <BlockListCard />
      </div>

      <DeactivateSection isTwoFactorActivated={isTwoFactorActivated} />

      {/* Change Email Modal */}
      <ChangeEmailModal
        open={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleEmailUpdate}
        isTwoFactorActivated={isTwoFactorActivated}
      />
    </div>
  );
}
