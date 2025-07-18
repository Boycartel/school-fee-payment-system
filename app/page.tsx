import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Shield, Smartphone, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-fpb-blue text-white border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="The Federal Polytechnic Bida Logo"
              width={60}
              height={60}
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-white hidden sm:block">The Federal Polytechnic Bida</h1>
              <p className="text-sm text-gray-300 hidden sm:block">Fee Confirmation System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/student/login">
              <Button variant="outline" className="border-gray-300 text-white hover:bg-gray-700 bg-transparent">
                Student Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-fpb-blue text-white">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Automated School Fee
                <span className="block text-blue-400">Confirmation System</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Streamline your payment verification process with our secure, QR code-enabled platform designed
                specifically for Federal Polytechnic Bida students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/student/login">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                    Access Student Portal
                  </Button>
                </Link>
                <Link href="/verify">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-white hover:bg-gray-700 text-lg px-8 py-4 bg-transparent"
                  >
                    Verify Payment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-fpb-blue-light">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our System?</h2>
              <p className="text-xl text-gray-300">Modern, secure, and efficient payment verification</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-fpb-blue border-gray-700 text-white text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Instant Verification</h3>
                  <p className="text-gray-300">
                    Verify your payment status instantly using your Remita RRR, matric number, or email address.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-fpb-blue border-gray-700 text-white text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">QR Code Technology</h3>
                  <p className="text-gray-300">
                    Generate and scan QR codes for quick payment verification and receipt management.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-fpb-blue border-gray-700 text-white text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                  <p className="text-gray-300">
                    Your payment information is protected with enterprise-grade security and encryption.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-fpb-blue border-gray-700 text-white text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">24/7 Access</h3>
                  <p className="text-gray-300">
                    Access your payment records and generate verification codes anytime, anywhere.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-gray-300">Simple steps to verify your payment</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Activate Account</h3>
                <p className="text-gray-300">
                  Register with your matric number and personal details to activate your student account.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Make Payment</h3>
                <p className="text-gray-300">
                  Complete your fee payment through the Remita platform and save your reference number.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Verify & Generate QR</h3>
                <p className="text-gray-300">
                  Login to your portal to view payment status and generate QR codes for verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-fpb-blue-light">
          <div className="container mx-auto text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of students already using our secure payment verification system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/student/activate">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4">
                    Activate Account
                  </Button>
                </Link>
                <Link href="/student/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-white hover:bg-gray-700 text-lg px-8 py-4 bg-transparent"
                  >
                    Login to Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-fpb-blue-light text-white border-t border-gray-700 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/logo.png"
                  alt="The Federal Polytechnic Bida Logo"
                  width={40}
                  height={40}
                  className="h-8 w-auto"
                />
                <h3 className="text-lg font-bold">Federal Polytechnic Bida</h3>
              </div>
              <p className="text-gray-300">
                Leading the way in technological innovation and academic excellence in Nigeria.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/student/activate" className="hover:text-white">
                    Activate Account
                  </Link>
                </li>
                <li>
                  <Link href="/student/login" className="hover:text-white">
                    Student Login
                  </Link>
                </li>
                <li>
                  <Link href="/verify" className="hover:text-white">
                    Verify Payment
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Email: support@fpb.edu.ng</li>
                <li>Phone: +234 (0) 803 123 4567</li>
                <li>Office Hours: 8:00 AM - 5:00 PM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>© {new Date().getFullYear()} The Federal Polytechnic Bida. All rights reserved.</p>
            <p className="text-sm mt-2">Developed by Soundmind Digitals</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
