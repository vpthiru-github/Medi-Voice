import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  experience: number;
  fee: number;
  available: boolean;
  phone?: string;
  email?: string;
  address?: string;
  bio?: string;
}

interface AppointmentBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
  onBookingSuccess: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  duration: number; // in minutes
}

interface AvailableSlot {
  date: string;
  slots: TimeSlot[];
}

const AppointmentBookingModal = ({ 
  open, 
  onOpenChange, 
  doctor, 
  onBookingSuccess 
}: AppointmentBookingModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [appointmentType, setAppointmentType] = useState("consultation");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const { toast } = useToast();

  // Generate available slots - will be enhanced to fetch from backend
  const generateFutureSlots = () => {
    const slots = [];
    const today = new Date();
    
    // Generate slots for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      slots.push({
        date: dateString,
        slots: [
          { time: "09:00", available: true, duration: 30 },
          { time: "09:30", available: true, duration: 30 },
          { time: "10:00", available: true, duration: 30 },
          { time: "10:30", available: true, duration: 30 },
          { time: "11:00", available: true, duration: 30 },
          { time: "11:30", available: true, duration: 30 },
          { time: "12:00", available: true, duration: 30 },
          { time: "12:30", available: true, duration: 30 },
          { time: "14:00", available: true, duration: 30 },
          { time: "14:30", available: true, duration: 30 },
          { time: "15:00", available: true, duration: 30 },
          { time: "15:30", available: true, duration: 30 },
          { time: "16:00", available: true, duration: 30 },
          { time: "16:30", available: true, duration: 30 }
        ]
      });
    }
    
    return slots;
  };

  // Fetch real availability from backend
  const fetchAvailability = async (doctorId: string, date: string) => {
    try {
      const token = localStorage.getItem("auth.token");
      const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${baseApiUrl}/api/patient/available-slots/${doctorId}/${date}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.availableSlots || [];
      } else {
        console.error("Failed to fetch availability:", response.statusText);
        return [];
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      return [];
    }
  };

  // Initialize slots and fetch real data when modal opens
  useEffect(() => {
    if (open && doctor) {
      const initSlots = generateFutureSlots();
      setAvailableSlots(initSlots);
      
      // Optionally fetch real availability for the first few days
      // This can be enhanced to fetch all days or on-demand
    }
  }, [open, doctor]);

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedDate || !selectedTime) {
        toast({
          title: "Missing Selection",
          description: "Please select both date and time.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedDuration(30);
    setAppointmentType("consultation");
    setReason("");
    setNotes("");
    setIsBooking(false);
  };

  // Check availability before booking
  const checkAvailability = async (doctorId: string, scheduledTime: string) => {
    try {
      const token = localStorage.getItem("auth.token");
      const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${baseApiUrl}/api/patient/check-availability`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctor: doctorId,
          scheduledTime: scheduledTime,
        }),
      });

      const data = await response.json();
      return data.success && data.data.available;
    } catch (error) {
      console.error("Error checking availability:", error);
      return false;
    }
  };

  const handleBooking = async () => {
    if (!doctor || !selectedDate || !selectedTime) return;

    setIsBooking(true);

    try {
      // Create the scheduled time in the correct format
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const scheduledTime = scheduledDateTime.toISOString();

      // First check if the slot is available
      const isAvailable = await checkAvailability(doctor.id, scheduledTime);
      
      if (!isAvailable) {
        toast({
          title: "Booking Failed",
          description: "Time slot is not available",
          variant: "destructive",
        });
        setIsBooking(false);
        return;
      }

      const token = localStorage.getItem("auth.token");
      const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const bookingData = {
        doctor: doctor.id,
        scheduledTime: scheduledTime,
        appointmentType,
        reason: reason || "General consultation",
        notes: notes || "",
        duration: selectedDuration
      };

      const response = await fetch(`${baseApiUrl}/api/patient/appointments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Success!",
          description: `Appointment booked successfully! Reference: ${data.data.appointmentNumber}`,
        });
        
        // Update the available slots to reflect the booking
        const updatedSlots = availableSlots.map(daySlots => {
          if (daySlots.date === selectedDate) {
            return {
              ...daySlots,
              slots: daySlots.slots.map(slot => 
                slot.time === selectedTime ? { ...slot, available: false } : slot
              )
            };
          }
          return daySlots;
        });
        setAvailableSlots(updatedSlots);
        
        resetForm();
        onOpenChange(false);
        onBookingSuccess();
      } else {
        toast({
          title: "Booking Failed",
          description: data.message || "Failed to book appointment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSelectedDateSlots = () => {
    return availableSlots.find(slot => slot.date === selectedDate)?.slots || [];
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Book Appointment
          </DialogTitle>
          <DialogDescription>
            Schedule your appointment with {doctor.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor Information Panel */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                    {doctor.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight">{doctor.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {doctor.specialty}
                  </CardDescription>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{doctor.rating}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>{doctor.hospital}</span>
              </div>
              {doctor.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{doctor.phone}</span>
                </div>
              )}
              {doctor.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{doctor.email}</span>
                </div>
              )}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Consultation Fee</span>
                  <span className="text-lg font-bold text-green-600">${doctor.fee}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Date & Time Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Select Date & Time
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred appointment date and time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Available Dates */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Available Dates</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {availableSlots.map((daySlot) => (
                        <Button
                          key={daySlot.date}
                          variant={selectedDate === daySlot.date ? "default" : "outline"}
                          className="h-auto p-3 flex-col items-start"
                          onClick={() => setSelectedDate(daySlot.date)}
                        >
                          <span className="font-medium">{formatDate(daySlot.date)}</span>
                          <span className="text-xs opacity-70">
                            {new Date(daySlot.date).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric" 
                            })}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Available Times */}
                  {selectedDate && (
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Available Times for {formatDate(selectedDate)}
                      </Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {getSelectedDateSlots().map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            className="h-auto p-2 text-xs"
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                          >
                            <div className="flex flex-col items-center">
                              <span>{formatTime(slot.time)}</span>
                              {!slot.available && (
                                <span className="text-red-500 text-[10px]">Booked</span>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Duration Selection */}
                  {selectedTime && (
                    <div>
                      <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
                      <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(parseInt(value))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Appointment Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Details</CardTitle>
                  <CardDescription>
                    Provide details about your appointment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="type">Appointment Type</Label>
                    <Select value={appointmentType} onValueChange={setAppointmentType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">General Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="checkup">Health Checkup</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason for Visit *</Label>
                    <Input
                      id="reason"
                      placeholder="Brief description of your health concern"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information, medications you're taking, or questions you'd like to discuss..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Appointment Summary
                  </CardTitle>
                  <CardDescription>
                    Please review your appointment details before confirming
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Doctor:</Label>
                        <p className="font-medium">{doctor.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Date & Time:</Label>
                        <p className="font-medium">
                          {formatDate(selectedDate)} at {formatTime(selectedTime)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Duration:</Label>
                        <p className="font-medium">{selectedDuration} minutes</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Type:</Label>
                        <p className="font-medium capitalize">{appointmentType}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-600">Consultation Fee:</Label>
                      <p className="text-lg font-bold text-green-600">${doctor.fee}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    <h4 className="flex items-center gap-2 font-medium text-orange-800 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      Important Information:
                    </h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Please arrive 15 minutes before your appointment time</li>
                      <li>• Bring your ID and insurance information</li>
                      <li>• For video calls, ensure stable internet connection</li>
                      <li>• Cancellation policy: 24 hours notice required</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 1 ? "Cancel" : "Previous"}
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!selectedDate || !selectedTime)) ||
                    (currentStep === 2 && !reason)
                  }
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleBooking}
                  disabled={isBooking}
                  className="flex items-center gap-2"
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingModal;