import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle2, User, Globe, Video, Save, UploadCloud, Phone } from 'lucide-react';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { DEFAULT_PFP } from '../../constants/assets';

export const CreatorEditProfile = () => {
  const navigate = useNavigate();
  const { creatorUser, uploadProfilePicture, updateUserProfile, setCreatorUser } = useAuth();
  const { showAlert } = useAlert();
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(creatorUser?.name || 'unknown');
  const [channel, setChannel] = useState(creatorUser?.channel || 'unknown');
  const [email, setEmail] = useState(creatorUser?.email || 'unknown');
  const [avatar, setAvatar] = useState(creatorUser?.profileImage || creatorUser?.avatar || DEFAULT_PFP);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(creatorUser?.phoneNumber || creatorUser?.phone || '');
  const [bio, setBio] = useState(
    creatorUser?.bio || 'Tech & SaaS Storyteller focused on AI workflows, consumer hardware, and developer tutorials.'
  );
  const [category, setCategory] = useState(creatorUser?.category || 'Tech & Software');
  const [youtubeUrl, setYoutubeUrl] = useState('https://youtube.com/@jasonvance');
  const [twitterUrl, setTwitterUrl] = useState('https://x.com/jasonvance');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingImg(true);
      try {
        const url = await uploadProfilePicture(file);
        if (url) {
          setAvatar(url);
          showAlert('Profile picture updated from PC!', 'success');
        }
      } catch (err) {
        showAlert('Failed to upload picture from PC', 'error');
      } finally {
        setIsUploadingImg(false);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        bio: bio.trim(),
        phone: phoneNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        category: category.trim(),
      });
      setSavedSuccess(true);
      showAlert('Profile details saved to backend successfully!', 'success');
      setTimeout(() => {
        setSavedSuccess(false);
        navigate('/creator/profile');
      }, 1000);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save profile changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7 pb-16 animate-fade-in text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title="Edit Profile"
        description="Update your creator account settings, channel branding, and contact details."
      />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/creator/profile')}
            className="p-2 rounded-xl bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] text-[#261615] dark:text-[#FDEBDE] hover:bg-[#FFEBAA] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#261615] bg-[#FFEBAA] px-2.5 py-0.5 rounded-md border-2 border-[#382322] shadow-[2px_2px_0_#382322]">
                Account Settings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#261615] dark:text-[#FDEBDE] tracking-tight">
              Edit Creator Profile
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-6 flex flex-col sm:flex-row items-center sm:items-center gap-5">
          <div className="relative group shrink-0">
            <img
              src={avatar || DEFAULT_PFP}
              alt={name ? `${name} avatar preview` : 'Creator avatar preview'}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PFP;
              }}
              className="w-20 h-20 rounded-full object-cover border-4 border-[#382322] dark:border-[#FFEBAA] shadow-[2px_2px_0_#382322] bg-[#FAF0E6]"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white cursor-pointer"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-sm sm:text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE]">Profile Photo</h3>
            <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5">
              Defaulted to ImageKit avatar. Upload custom picture from your computer.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-mono font-bold text-[#261615] dark:text-[#FFEBAA] underline underline-offset-2 flex items-center justify-center sm:justify-start gap-1 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {isUploadingImg ? 'Uploading from PC...' : 'Upload from PC'}
            </button>
          </div>
        </div>

        {/* Identity Form */}
        <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-6 md:p-7 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                Full Name / Creator Handle
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                Channel Name
              </label>
              <input
                type="text"
                required
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA]" />
                  Phone Number
                </span>
                <span className="text-[11px] font-normal text-[#5C3A38] dark:text-[#D4B8A8]">Optional</span>
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-sm font-semibold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all placeholder:text-[#5C3A38]/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
              Bio & Channel Overview
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-medium text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] resize-none leading-relaxed transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-[#261615] dark:text-[#FDEBDE] block mb-1.5">
              Primary Channel Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs font-bold text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all cursor-pointer"
            >
              <option>Tech & Software</option>
              <option>Lifestyle & Travel</option>
              <option>Business & Finance</option>
              <option>Gaming & Entertainment</option>
              <option>Education & Documentaries</option>
            </select>
          </div>
        </div>

        {/* Social / Channel Links */}
        <div className="bg-[#FFF7F1] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-2xl shadow-[4px_4px_0_#382322] p-6 md:p-7 space-y-4">
          <h3 className="text-sm sm:text-base font-black font-serif text-[#261615] dark:text-[#FDEBDE] mb-2">Connected Creator Channels</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] block mb-1">YouTube Channel URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] block mb-1">Twitter / X Profile</label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1A1110] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-xs text-[#261615] dark:text-[#FDEBDE] focus:outline-none focus:ring-2 focus:ring-[#FFEBAA] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate('/creator/profile')}
            className="text-xs font-mono font-bold text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] cursor-pointer"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            disabled={isSaving}
            className="px-6 py-2.5 cursor-pointer"
          >
            {savedSuccess ? 'Changes Saved ✓' : isSaving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatorEditProfile;

