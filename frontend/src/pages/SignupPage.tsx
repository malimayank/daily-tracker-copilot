import SignupForm from '../components/Auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 px-4 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-3xl shadow-lg shadow-primary-200 dark:shadow-primary-900/50">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Start tracking your productivity today
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
