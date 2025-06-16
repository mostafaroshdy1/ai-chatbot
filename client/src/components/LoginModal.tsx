import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { useToast } from '@/components/ui/use-toast';
import { AxiosError } from 'axios';

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	onLogin: (email: string, password: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
	isOpen,
	onClose,
	onLogin,
}) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [isSignUp, setIsSignUp] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (isSignUp) {
				await authApi.register({
					email,
					password,
					firstName,
					lastName,
				});
				toast({
					title: 'Account created successfully!',
					description: 'You can now log in with your credentials.',
				});
				setIsSignUp(false);
			} else {
				const response = await authApi.login({
					email,
					password,
				});
				onLogin(email, password);
				onClose();
			}
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>;
			toast({
				title: 'Error',
				description:
					axiosError.response?.data?.message ||
					'Something went wrong. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-center text-xl font-bold">
						{isSignUp ? 'Create Account' : 'Welcome Back'}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{isSignUp && (
						<>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										value={firstName}
										onChange={(e) => setFirstName(e.target.value)}
										placeholder="Enter your first name"
										required={isSignUp}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										value={lastName}
										onChange={(e) => setLastName(e.target.value)}
										placeholder="Enter your last name"
										required={isSignUp}
									/>
								</div>
							</div>
						</>
					)}

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
						/>
					</div>

					<Button
						type="submit"
						className="w-full bg-purple-600 hover:bg-purple-700"
						disabled={isLoading}
					>
						{isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
					</Button>

					<div className="text-center">
						<button
							type="button"
							onClick={() => {
								setIsSignUp(!isSignUp);
								setFirstName('');
								setLastName('');
							}}
							className="text-sm text-purple-600 hover:text-purple-700"
						>
							{isSignUp
								? 'Already have an account? Sign in'
								: "Don't have an account? Sign up"}
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default LoginModal;
