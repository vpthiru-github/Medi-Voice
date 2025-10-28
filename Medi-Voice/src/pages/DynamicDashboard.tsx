import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AppointmentBookingModal from "@/components/AppointmentBookingModal";
import {
  Bell,
  Calendar,
  FileText,
  Pill,
  User,
  Heart,
  Activity,
  Clock,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  TrendingUp,
  Zap,
  Shield,
  Star,
  CreditCard,
  Settings,
  HelpCircle,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  Stethoscope,
  Building2,
  TestTube,
  Receipt,
  MapPin,
  UserCheck,
  Eye,
  History,
  Wallet,
  Lock,
  Smartphone,
  X,
  Plus,
  Edit,
  Trash2,
  Brain,
} from "lucide-react";
import HealthMetricsChart from "@/components/charts/HealthMetricsChart";
import AppointmentTrendsChart from "@/components/charts/AppointmentTrendsChart";
import HealthScoreChart from "@/components/charts/HealthScoreChart";
interface PatientData {
  _id: string;
  patientId: string;
  medicalRecordNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  status?: string;
  totalAppointments?: number;
  registrationDate?: string;
  userId?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
}

interface DashboardData {
  patient: PatientData;
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    upcomingAppointments: number;
    totalPrescriptions: number;
  };
  upcomingAppointments: any[];
  recentAppointments: any[];
  recentPrescriptions: any[];
  recentMedicalRecords: any[];
}

const DynamicDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Mock health data for charts (will be replaced with real data later)
  const [healthMetricsData] = useState([
    { date: "2024-01-01", heartRate: 72, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, weight: 175 },
    { date: "2024-01-15", heartRate: 75, bloodPressureSystolic: 118, bloodPressureDiastolic: 78, weight: 173 },
    { date: "2024-02-01", heartRate: 70, bloodPressureSystolic: 122, bloodPressureDiastolic: 82, weight: 172 },
    { date: "2024-02-15", heartRate: 68, bloodPressureSystolic: 115, bloodPressureDiastolic: 75, weight: 170 },
    { date: "2024-03-01", heartRate: 72, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, weight: 171 },
    { date: "2024-03-15", heartRate: 74, bloodPressureSystolic: 125, bloodPressureDiastolic: 85, weight: 173 }
  ]);

  const [appointmentTrendsData] = useState([
    { month: "Jan", scheduled: 3, completed: 2, cancelled: 1, upcoming: 1 },
    { month: "Feb", scheduled: 4, completed: 3, cancelled: 0, upcoming: 1 },
    { month: "Mar", scheduled: 2, completed: 2, cancelled: 0, upcoming: 0 },
    { month: "Apr", scheduled: 5, completed: 4, cancelled: 1, upcoming: 0 },
    { month: "May", scheduled: 3, completed: 2, cancelled: 0, upcoming: 1 },
    { month: "Jun", scheduled: 4, completed: 3, cancelled: 1, upcoming: 0 }
  ]);

  const [healthScoreData] = useState({
    overallScore: 87,
    categories: [
      { name: "Cardiovascular", value: 92, fill: "hsl(142, 76%, 36%)" },
      { name: "Respiratory", value: 88, fill: "hsl(142, 69%, 58%)" },
      { name: "Metabolic", value: 85, fill: "hsl(120, 60%, 50%)" },
      { name: "Mental Health", value: 90, fill: "hsl(200, 70%, 50%)" },
      { name: "Physical Activity", value: 82, fill: "hsl(45, 93%, 47%)" }
    ]
  });

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth.token");
      if (!token) {
        navigate("/login");
        return;
      }

      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patient/dashboard`;
      console.log("Fetching dashboard data from:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth.token");
          localStorage.removeItem("auth.user");
          navigate("/login");
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth.token");
    localStorage.removeItem("auth.user");
    navigate("/login");
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("auth.token");
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patient/appointments/${appointmentId}/cancel`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully.",
        });
        // Refresh appointments
        fetchAppointments();
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: error.message || "Could not cancel the appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch appointments from backend
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("auth.token");
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patient/appointments`;
      
      console.log("Fetching appointments from:", apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log("Appointments data:", data);
        setAppointments(data.data?.appointments || data.appointments || []);
      } else {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        // If no appointments exist yet, that's okay - just set empty array
        if (response.status === 404) {
          setAppointments([]);
        }
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // For now, set empty appointments array if there's an error
      setAppointments([]);
    }
  };

  // Handle doctor selection for booking
  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingModalOpen(true);
  };

  // Fetch doctors from backend
  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("auth.token");
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patient/doctors`;
      
      console.log("Fetching doctors from:", apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Doctors data:", data);
        
        // Transform backend doctor data to match frontend format
        const transformedDoctors = data.data?.doctors?.map(doctor => ({
          id: doctor._id,
          name: `Dr. ${doctor.userId?.firstName} ${doctor.userId?.lastName}`,
          specialty: doctor.specialty,
          hospital: doctor.hospital || "MediVoice Hospital",
          rating: doctor.rating?.average || 4.5,
          experience: doctor.experience || 10,
          fee: doctor.consultationFee || 200,
          available: true, // Since we're filtering for accepting patients
          phone: doctor.userId?.phone || "+1 (555) 123-4567",
          email: doctor.userId?.email,
          address: "123 Medical Plaza, Suite 200, City, ST 12345", // Default address
          bio: `Dr. ${doctor.userId?.lastName} is a highly experienced ${doctor.specialty?.toLowerCase()} specialist with ${doctor.experience || 10} years of practice.`
        })) || [];
        
        setDoctors(transformedDoctors);
      } else {
        console.error("Failed to fetch doctors:", response.status);
        // Fallback to sample data if API fails
        setDoctors([]);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      // Fallback to sample data if API fails
      setDoctors([]);
    }
  };

  // Load appointments and doctors when component mounts
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-green-100/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-green-100/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Failed to load dashboard data.</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { patient, stats, upcomingAppointments, recentAppointments } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-green-100/20 flex">
      {/* Side Navigation - Fixed Height */}
      <div className="w-64 bg-white border-r border-green-200 shadow-lg flex flex-col fixed h-screen">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-green-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">MediVoice</h1>
              <p className="text-xs text-green-600">Patient Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: Activity },
              { id: "ai-chatbot", label: "AI Chatbot", icon: Brain },
              { id: "records", label: "Medical Records", icon: FileText },
              { id: "doctors", label: "Doctors & Labs", icon: Stethoscope },
              { id: "appointments", label: "Appointments", icon: Calendar },
              { id: "payment", label: "Payment & Billing", icon: CreditCard },
              { id: "profile", label: "Profile & Settings", icon: Settings },
              { id: "help", label: "Help & Support", icon: HelpCircle },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 text-sm ${
                  activeTab === item.id
                    ? "bg-green-100 text-green-700 border border-green-200 shadow-sm"
                    : "text-slate-600 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile in Sidebar */}
        <div className="p-3 border-t border-green-200">
          <button
            onClick={() => setActiveTab("profile")}
            className="w-full flex items-center gap-2 p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 cursor-pointer"
          >
            <Avatar className="h-8 w-8 ring-2 ring-green-400/40">
              <AvatarImage src="/placeholder.svg" alt="Patient" />
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-sm">
                {patient?.userId?.firstName?.charAt(0) || patient?.firstName?.charAt(0) || 'P'}
                {patient?.userId?.lastName?.charAt(0) || patient?.lastName?.charAt(0) || 'T'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="font-semibold text-slate-800 text-sm">
                {patient?.userId?.firstName || patient?.firstName || 'Patient'} {patient?.userId?.lastName || patient?.lastName || ''}
              </p>
              <p className="text-xs text-green-600">Patient</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area - Adjusted for fixed sidebar */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-green-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {activeTab === "dashboard" && "Health Dashboard"}
                  {activeTab === "ai-chatbot" && "AI Chatbot"}
                  {activeTab === "records" && "Medical Records"}
                  {activeTab === "doctors" && "Doctors & Labs"}
                  {activeTab === "appointments" && "Appointments"}
                  {activeTab === "payment" && "Payment & Billing"}
                  {activeTab === "profile" && "Profile & Settings"}
                  {activeTab === "help" && "Help & Support"}
                </h2>
                <p className="text-slate-600">
                  Welcome back, {patient?.userId?.firstName || patient?.firstName || 'Patient'} {patient?.userId?.lastName || patient?.lastName || ''} (ID: {patient?.medicalRecordNumber || patient?.patientId || 'N/A'})
                </p>
              </div>
              
              {/* Top Right Actions */}
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setActiveTab("profile")}
                  className="hover:bg-green-100"
                >
                  <User className="h-5 w-5 text-slate-600" />
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  className="hover:bg-red-100 text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* AI Chatbot Tab Content */}
            {activeTab === "ai-chatbot" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/60 shadow-2xl shadow-blue-500/10">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Brain className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">AI Chatbot</h2>
                    <p className="text-slate-600 font-medium mb-6">Your intelligent healthcare assistant is ready to help</p>
                    <div className="bg-blue-50/80 rounded-xl p-6 border border-blue-200/60">
                      <p className="text-slate-700 text-lg">Coming Soon...</p>
                      <p className="text-slate-600 mt-2">The AI Chatbot feature is currently being developed to provide you with personalized health insights and assistance.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Tab Content */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Appointments</p>
                          <p className="text-2xl font-bold text-slate-800">{stats?.totalAppointments || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Completed</p>
                          <p className="text-2xl font-bold text-slate-800">{stats?.completedAppointments || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Upcoming</p>
                          <p className="text-2xl font-bold text-slate-800">{stats?.upcomingAppointments || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                          <Pill className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Prescriptions</p>
                          <p className="text-2xl font-bold text-slate-800">{stats?.totalPrescriptions || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Health Charts - Empty State for New Patients */}
                {stats?.totalAppointments > 0 ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <HealthScoreChart 
                        overallScore={healthScoreData?.overallScore || 0}
                        categories={healthScoreData?.categories || []}
                        title="Health Score Overview"
                        height={350}
                      />
                      <HealthMetricsChart 
                        data={healthMetricsData || []}
                        title="Vital Signs Trends"
                        height={350}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8">
                      <AppointmentTrendsChart 
                        data={appointmentTrendsData || []}
                        title="Appointment History"
                        height={300}
                        type="bar"
                      />
                    </div>
                  </>
                ) : (
                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-8 text-center">
                      <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">Welcome to MediVoice!</h3>
                      <p className="text-slate-600 mb-6">
                        As a new patient, your health charts and appointment history will appear here after your first consultation.
                      </p>
                      <Button 
                        onClick={() => setActiveTab("doctors")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Find a Doctor to Get Started
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Upcoming Appointments */}
                {dashboardData.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardHeader className="bg-gradient-to-r from-green-100/80 to-green-50/80 border-b border-green-200/60">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        Upcoming Appointments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {dashboardData.upcomingAppointments.slice(0, 3).map((appointment) => (
                          <div key={appointment._id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-slate-800">
                                  Dr. {appointment.doctor?.userId?.firstName} {appointment.doctor?.userId?.lastName}
                                </h4>
                                <p className="text-sm text-green-600">{appointment.doctor?.specialty}</p>
                                <p className="text-sm text-slate-600">
                                  {new Date(appointment.scheduledTime).toLocaleDateString()} at{' '}
                                  {new Date(appointment.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <Badge variant="outline" className="border-green-200 text-green-700">
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">No Upcoming Appointments</h3>
                      <p className="text-slate-600 mb-6">
                        You don't have any scheduled appointments. Book your first consultation to get started.
                      </p>
                      <Button 
                        onClick={() => setActiveTab("doctors")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Book an Appointment
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Appointments */}
                {dashboardData.recentAppointments && dashboardData.recentAppointments.length > 0 ? (
                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardHeader className="bg-gradient-to-r from-green-100/80 to-green-50/80 border-b border-green-200/60">
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-green-600" />
                        Recent Medical Visits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {dashboardData.recentAppointments.slice(0, 3).map((appointment) => (
                          <div key={appointment._id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-slate-800">
                                  Dr. {appointment.doctor?.userId?.firstName} {appointment.doctor?.userId?.lastName}
                                </h4>
                                <p className="text-sm text-blue-600">{appointment.doctor?.specialization}</p>
                                <p className="text-sm text-slate-600">
                                  {new Date(appointment.scheduledTime).toLocaleDateString()}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            )}

            {/* Profile Tab Content */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Profile & Settings</h3>
                  {!isEditingProfile ? (
                    <Button onClick={() => setIsEditingProfile(true)} variant="outline" className="ml-4">
                      Edit
                    </Button>
                  ) : null}
                </div>

                <Card className="border border-green-200/60 shadow-xl bg-gradient-to-br from-white/95 to-green-50/95">
                  <CardHeader className="bg-gradient-to-r from-green-100/80 to-green-50/80 border-b border-green-200/60">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6 mb-6">
                      <Avatar className="h-20 w-20 ring-4 ring-green-400/40 shadow-lg shadow-green-500/20">
                        <AvatarImage src="/placeholder.svg" alt="Patient" />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-2xl">
                          {patient?.userId?.firstName?.charAt(0) || patient?.firstName?.charAt(0) || 'P'}
                          {patient?.userId?.lastName?.charAt(0) || patient?.lastName?.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {!isEditingProfile ? (
                          <>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">
                              {patient.firstName} {patient.lastName}
                            </h3>
                            <p className="text-green-600 font-semibold mb-1">
                              Patient ID: {patient.patientId}
                            </p>
                            <Badge className="bg-green-100 text-green-700 border-green-200">Patient</Badge>
                          </>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              className="border rounded px-2 py-1 text-lg font-bold"
                              value={patient.firstName}
                              onChange={e => setDashboardData(prev => prev ? { ...prev, patient: { ...prev.patient, firstName: e.target.value } } : prev)}
                              style={{width: 120}}
                            />
                            <input
                              className="border rounded px-2 py-1 text-lg font-bold"
                              value={patient.lastName}
                              onChange={e => setDashboardData(prev => prev ? { ...prev, patient: { ...prev.patient, lastName: e.target.value } } : prev)}
                              style={{width: 120}}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-2 block">Email Address</label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">{patient.email}</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-2 block">Phone Number</label>
                          {!isEditingProfile ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-slate-600">{patient.phone}</span>
                            </div>
                          ) : (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={patient.phone || ''}
                              onChange={e => setDashboardData(prev => prev ? { ...prev, patient: { ...prev.patient, phone: e.target.value } } : prev)}
                              placeholder="Enter phone number"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-2 block">Blood Type</label>
                          {!isEditingProfile ? (
                            <Badge variant="outline" className="border-red-200 text-red-700">
                              {patient.bloodType || 'Unknown'}
                            </Badge>
                          ) : (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={patient.bloodType || ''}
                              onChange={e => setDashboardData(prev => prev ? { ...prev, patient: { ...prev.patient, bloodType: e.target.value } } : prev)}
                              placeholder="Enter blood type"
                            />
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-2 block">Emergency Contact Name</label>
                          {!isEditingProfile ? (
                            <span className="text-sm text-slate-600">{patient.emergencyContact?.name || ''}</span>
                          ) : (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={patient.emergencyContact?.name || ''}
                              onChange={e => setDashboardData(prev => prev ? { ...prev, patient: { ...prev.patient, emergencyContact: { ...prev.patient.emergencyContact, name: e.target.value } } } : prev)}
                              placeholder="Enter emergency contact name"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-2 block">Emergency Contact Relationship</label>
                          {!isEditingProfile ? (
                            <span className="text-sm text-slate-600">{patient.emergencyContact?.relationship || ''}</span>
                          ) : (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={patient.emergencyContact?.relationship || ''}
                              onChange={e => setDashboardData(prev => prev ? { ...prev, patient: { ...prev.patient, emergencyContact: { ...prev.patient.emergencyContact, relationship: e.target.value } } } : prev)}
                              placeholder="Enter relationship"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-2 block">Emergency Contact Phone</label>
                          {!isEditingProfile ? (
                            <span className="text-sm text-slate-600">{patient.emergencyContact?.phone || ''}</span>
                          ) : (
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={patient.emergencyContact?.phone || ''}
                              onChange={e => setDashboardData(prev => prev ? { ...prev, patient: { ...prev.patient, emergencyContact: { ...prev.patient.emergencyContact, phone: e.target.value } } } : prev)}
                              placeholder="Enter emergency contact phone"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700 mb-2 block">Status</label>
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            {patient.status || 'Active'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {isEditingProfile && (
                      <div className="flex gap-2 mt-8">
                        <Button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem("auth.token");
                              const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patient/profile`;
                              const updateData = {
                                firstName: patient.firstName,
                                lastName: patient.lastName,
                                phone: patient.phone,
                                bloodType: patient.bloodType,
                                emergencyContact: patient.emergencyContact
                              };
                              const response = await fetch(apiUrl, {
                                method: 'PATCH',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(updateData)
                              });
                              if (!response.ok) throw new Error('Failed to update profile');
                              toast({ title: 'Profile updated!', description: 'Your profile was updated successfully.' });
                              setIsEditingProfile(false);
                            } catch (error) {
                              toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Save
                        </Button>
                        <Button onClick={() => setIsEditingProfile(false)} variant="outline">Cancel</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Medical Records Tab Content */}
            {activeTab === "records" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">Medical Records</h3>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Records
                  </Button>
                </div>

                {/* Empty State for New Patients */}
                <Card className="border border-green-200/60 shadow-xl bg-white">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Medical Records Yet</h3>
                    <p className="text-slate-600 mb-6">
                      As a new patient, your medical records will appear here after your first consultation.
                    </p>
                    <Button 
                      onClick={() => setActiveTab("appointments")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Book Your First Appointment
                    </Button>
                  </CardContent>
                </Card>

                {/* Sample Records Structure (for reference) */}
                <div className="grid gap-4">
                  <Card className="border border-slate-200 opacity-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-800">Sample: General Checkup</h4>
                          <p className="text-sm text-slate-600">Dr. Sarah Johnson • Cardiology</p>
                          <p className="text-xs text-slate-500">This is how your records will appear</p>
                        </div>
                        <Badge variant="outline" className="text-slate-400">Sample</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Doctors & Labs Tab Content */}
            {activeTab === "doctors" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Doctors & Labs</h3>

                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search doctors by name or specialty..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Available Doctors */}
                <div className="grid gap-4">
                  {doctors.length > 0 ? doctors.map((doctor, index) => (
                    <Card key={index} className="border border-green-200/60 shadow-xl bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg" alt={doctor.name} />
                              <AvatarFallback className="bg-green-100 text-green-700">
                                {doctor.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-slate-800">{doctor.name}</h4>
                              <p className="text-sm text-slate-600">{doctor.specialty}</p>
                              <p className="text-xs text-slate-500">{doctor.hospital}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-slate-600 ml-1">{doctor.rating}</span>
                                </div>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-600">{doctor.experience} years exp</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-800">${doctor.fee}</p>
                            <p className="text-xs text-slate-500">Consultation</p>
                            <Button 
                              className="mt-2"
                              disabled={!doctor.available}
                              onClick={() => handleBookAppointment(doctor)}
                            >
                              {doctor.available ? "Book Now" : "Unavailable"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <Card className="border border-green-200/60 shadow-xl bg-white">
                      <CardContent className="p-8 text-center">
                        <Stethoscope className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Doctors Available</h3>
                        <p className="text-slate-600 mb-6">
                          We're currently loading our available doctors. Please check back in a moment.
                        </p>
                        <Button 
                          onClick={fetchDoctors}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Refresh Doctors
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Appointments Tab Content */}
            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">My Appointments</h3>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setActiveTab("doctors")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>

                {/* Appointments List */}
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <Card key={appointment._id} className="border border-green-200/60 shadow-xl bg-white">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src="/placeholder.svg" alt="Doctor" />
                                <AvatarFallback className="bg-green-100 text-green-700">
                                  {appointment.doctor?.user?.firstName?.[0]}{appointment.doctor?.user?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-slate-800">
                                  Dr. {appointment.doctor?.userId?.firstName} {appointment.doctor?.userId?.lastName}
                                </h4>
                                <p className="text-sm text-slate-600">{appointment.doctor?.specialization}</p>
                                <p className="text-sm text-slate-500">
                                  {new Date(appointment.scheduledTime).toLocaleDateString()} at {new Date(appointment.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{appointment.reason}</p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end space-y-2">
                              <Badge 
                                className={
                                  appointment.status === 'scheduled' ? "bg-blue-100 text-blue-700 border-blue-200" :
                                  appointment.status === 'confirmed' ? "bg-green-100 text-green-700 border-green-200" :
                                  appointment.status === 'completed' ? "bg-gray-100 text-gray-700 border-gray-200" :
                                  "bg-red-100 text-red-700 border-red-200"
                                }
                              >
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                              <p className="text-sm text-slate-600 mt-2">${appointment.consultationFee}</p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" /> View
                                </Button>
                                {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                                  <Button size="sm" variant="destructive" onClick={() => handleCancelAppointment(appointment._id)}>
                                    <X className="h-4 w-4 mr-1" /> Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">No Appointments Scheduled</h3>
                      <p className="text-slate-600 mb-6">
                        You haven't booked any appointments yet. Start by finding a doctor that suits your needs.
                      </p>
                      <Button 
                        onClick={() => setActiveTab("doctors")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Find a Doctor
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Appointment Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-800">Upcoming</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {appointments.filter(apt => 
                          apt.status === 'scheduled' || apt.status === 'confirmed'
                        ).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-4 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-800">Completed</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {appointments.filter(apt => apt.status === 'completed').length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-4 text-center">
                      <X className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-slate-800">Cancelled</h4>
                      <p className="text-2xl font-bold text-red-600">
                        {appointments.filter(apt => apt.status === 'cancelled').length}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Payment & Billing Tab Content */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Payment & Billing</h3>

                {/* Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                          <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Spent</p>
                          <p className="text-2xl font-bold text-slate-800">$0.00</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                          <Receipt className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Pending Bills</p>
                          <p className="text-2xl font-bold text-slate-800">$0.00</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-200/60 shadow-xl bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                          <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Payment Methods</p>
                          <p className="text-2xl font-bold text-slate-800">0</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Empty State */}
                <Card className="border border-green-200/60 shadow-xl bg-white">
                  <CardContent className="p-8 text-center">
                    <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Payment History</h3>
                    <p className="text-slate-600 mb-6">
                      Your payment history and billing information will appear here after your first appointment.
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Help & Support Tab Content */}
            {activeTab === "help" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Help & Support</h3>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border border-green-200/60 shadow-xl bg-white hover:shadow-2xl transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-slate-800 mb-2">Live Chat</h4>
                      <p className="text-sm text-slate-600">Get instant help from our support team</p>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-200/60 shadow-xl bg-white hover:shadow-2xl transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Phone className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-slate-800 mb-2">Call Support</h4>
                      <p className="text-sm text-slate-600">Speak directly with our team</p>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-200/60 shadow-xl bg-white hover:shadow-2xl transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Mail className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-slate-800 mb-2">Email Us</h4>
                      <p className="text-sm text-slate-600">Send us your questions via email</p>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-200/60 shadow-xl bg-white hover:shadow-2xl transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <HelpCircle className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-slate-800 mb-2">FAQ</h4>
                      <p className="text-sm text-slate-600">Find answers to common questions</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Information */}
                <Card className="border border-green-200/60 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Emergency Support</h4>
                        <p className="text-slate-600">24/7 Emergency Line</p>
                        <p className="font-semibold text-green-600">+1 (555) 911-HELP</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">General Support</h4>
                        <p className="text-slate-600">Mon-Fri, 8AM-6PM EST</p>
                        <p className="font-semibold text-blue-600">+1 (555) 123-CARE</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card className="border border-green-200/60 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-green-600" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        question: "How do I book my first appointment?",
                        answer: "Go to the 'Doctors & Labs' tab, search for a doctor, and click 'Book Now'."
                      },
                      {
                        question: "How can I access my medical records?",
                        answer: "Visit the 'Medical Records' tab to view all your consultation history and reports."
                      },
                      {
                        question: "What payment methods do you accept?",
                        answer: "We accept all major credit cards, debit cards, and health insurance plans."
                      },
                      {
                        question: "How do I update my profile information?",
                        answer: "Go to 'Profile & Settings' to update your personal and medical information."
                      }
                    ].map((faq, index) => (
                      <div key={index} className="border-b border-slate-200 pb-4 last:border-b-0">
                        <h5 className="font-semibold text-slate-800 mb-2">{faq.question}</h5>
                        <p className="text-slate-600 text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        doctor={selectedDoctor}
        onBookingSuccess={async () => {
          await fetchAppointments();
          await fetchDashboardData();
          await fetchDoctors();
          setActiveTab("appointments");
        }}
      />
    </div>
  );
};

export default DynamicDashboard;
