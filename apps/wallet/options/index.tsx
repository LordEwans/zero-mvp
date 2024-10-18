import { zodResolver } from "@hookform/resolvers/zod"
import * as RadixIcons from "@radix-ui/react-icons"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot
} from "~/components/ui/input-otp"
import { useToast } from "~/hooks/use-toast"

import "../styles/global.css"

import * as Comlink from "comlink"
const { init, Prover, NotarizedSession, TlsProof }: any = Comlink.wrap(
  new Worker(new URL("./worker.ts", import.meta.url), {type: 'module'})
)
console.log(init)

const emailFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" })
})

const otpFormSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits" })
})

type EmailFormValues = z.infer<typeof emailFormSchema>
type OtpFormValues = z.infer<typeof otpFormSchema>

const EmailForm = ({
  onSubmit
}: {
  onSubmit: (values: EmailFormValues) => Promise<void>
}) => {
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: ""
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <RadixIcons.UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
}

const OtpForm = ({
  onSubmit
}: {
  onSubmit: (values: OtpFormValues) => Promise<void>
}) => {
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: ""
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent>
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Pin</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}>
                    <InputOTPGroup>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={1} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={4} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <RadixIcons.UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
}

export default function OptionsIndex() {
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [emailId, setEmailId] = useState("")
  const { toast } = useToast()

  document.body.classList.add("dark")

  const handleEmailSubmit = async (values: EmailFormValues) => {
    try {
      const response = await fetch("http://localhost:3000/api/sendOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: values.email })
      })

      if (!response.ok) {
        throw new Error("Failed to send OTP")
      }

      const result = await response.json()
      console.log(result.response)

      toast({
        title: "Check your email",
        description: "We've sent you a one-time password!"
      })
      setEmailId(result.response.email_id)
      setShowOtpForm(true)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred"
      })
    }
  }

  const handleOtpSubmit = async (values: OtpFormValues) => {
    try {
      const response = await fetch("http://localhost:3000/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ methodId: emailId, code: values.otp })
      })

      if (!response.ok) {
        throw new Error("Failed to verify OTP")
      }

      const result = await response.json()
      console.log(result.response)

      toast({
        title: "Success",
        description: "You have successfully signed in!"
      })
      // Here you would typically redirect the user or update the app state
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred"
      })
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Now, let's get you started</CardTitle>
          <CardDescription>
            {showOtpForm
              ? "Enter the one-time pin sent to your email"
              : "Enter your email to receive a one-time pin"}
          </CardDescription>
        </CardHeader>
        {showOtpForm ? (
          <OtpForm onSubmit={handleOtpSubmit} />
        ) : (
          <EmailForm onSubmit={handleEmailSubmit} />
        )}
      </Card>
    </div>
  )
}
