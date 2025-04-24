import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { InfoIcon, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const counselingFormSchema = z.object({
  type: z.string({
    required_error: "Please select counseling type",
  }),
  counselorId: z.string().optional(),
  appointmentDate: z.string({
    required_error: "Please select a date",
  }),
  appointmentTime: z.string({
    required_error: "Please select a time",
  }),
  notes: z.string().optional(),
});

type CounselingFormValues = z.infer<typeof counselingFormSchema>;

export default function CounselingPage() {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState({
    date: "",
    time: "",
    counselor: ""
  });
  const { toast } = useToast();

  const { data: counselors, isLoading: isLoadingCounselors } = useQuery({
    queryKey: ["/api/counselors"],
    queryFn: async () => {
      const res = await fetch("/api/counselors");
      if (!res.ok) throw new Error("Failed to fetch counselors");
      return await res.json();
    },
  });

  const form = useForm<CounselingFormValues>({
    resolver: zodResolver(counselingFormSchema),
    defaultValues: {
      notes: "",
    },
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: CounselingFormValues) => {
      const formattedData = {
        ...data,
        counselorId: data.counselorId ? parseInt(data.counselorId) : undefined,
      };
      const res = await apiRequest("POST", "/api/counseling/appointments", formattedData);
      return await res.json();
    },
    onSuccess: (data, variables) => {
      let counselorName = "Any available counselor";
      if (variables.counselorId && counselors) {
        const counselor = counselors.find((c: any) => c.id.toString() === variables.counselorId);
        if (counselor) {
          counselorName = counselor.name;
        }
      }
      const formattedDate = new Date(variables.appointmentDate).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      setConfirmedAppointment({
        date: formattedDate,
        time: formatTime(variables.appointmentTime),
        counselor: counselorName
      });
      setSuccessDialogOpen(true);
      form.reset();
      toast({
        title: "Appointment Booked",
        description: "Your counseling session has been scheduled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CounselingFormValues) => {
    bookAppointmentMutation.mutate(data);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <Layout title="Counseling" subtitle="Book an appointment">
      <motion.section className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Student Counseling Services</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Our counselors are here to support your academic success and personal well-being.
              Book an appointment with our trained professionals.
            </p>
            <Alert className="mt-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900">
              <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
              <AlertDescription>
                All sessions are confidential and free for enrolled students.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Book an Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Counseling</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select counseling type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="academic">Academic Counseling</SelectItem>
                        <SelectItem value="career">Career Guidance</SelectItem>
                        <SelectItem value="personal">Personal Support</SelectItem>
                        <SelectItem value="mental-health">Mental Health</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="counselorId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Counselor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any available counselor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCounselors ? (
                          <SelectItem value="loading" disabled>Loading counselors...</SelectItem>
                        ) : counselors && counselors.length > 0 ? (
                          counselors.map((counselor: any) => (
                            <SelectItem key={counselor.id} value={counselor.id.toString()}>
                              {counselor.name} ({counselor.specialty})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No counselors available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Leave empty to be assigned to any available counselor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="appointmentDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Date</FormLabel>
                    <FormControl>
                      <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="appointmentTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="09:00">09:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="13:00">01:00 PM</SelectItem>
                        <SelectItem value="14:00">02:00 PM</SelectItem>
                        <SelectItem value="15:00">03:00 PM</SelectItem>
                        <SelectItem value="16:00">04:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Please share any specific concerns or questions" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full" disabled={bookAppointmentMutation.isPending}>
                  {bookAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.section>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-300 mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <DialogTitle className="text-xl font-bold">Appointment Booked!</DialogTitle>
              <DialogDescription className="text-center mt-2">
                Your counseling session has been scheduled. You'll receive a confirmation email shortly.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
            <div className="flex items-center text-sm mb-2">
              <span className="material-icons text-gray-500 dark:text-gray-400 text-base mr-2">event</span>
              <span className="font-medium">{confirmedAppointment.date}</span>
            </div>
            <div className="flex items-center text-sm mb-2">
              <span className="material-icons text-gray-500 dark:text-gray-400 text-base mr-2">schedule</span>
              <span className="font-medium">{confirmedAppointment.time}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="material-icons text-gray-500 dark:text-gray-400 text-base mr-2">person</span>
              <span className="font-medium">{confirmedAppointment.counselor}</span>
            </div>
          </div>

          <Button className="w-full" onClick={() => setSuccessDialogOpen(false)}>
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}