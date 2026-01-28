import { Avatar, Box, Typography } from "@mui/material";
import { useRef } from "react";
import { PhotoCamera } from "@mui/icons-material";

export default function ProfileSettingsCard({ profile, handleAvatarChange }) {
	const fileInputRef = useRef(null);

	return (
		<Box>
			<Typography variant="h6" fontWeight={700} mb={2}>
				Perfil do usuário
			</Typography>

			{/* Avatar com overlay */}
			<Box
				sx={{
					position: "relative",
					width: 96,
					height: 96,
					mx: "auto",
					mb: 3,
					cursor: "pointer",
					"&:hover .avatar-overlay": {
						opacity: 1,
					},
				}}
				onClick={() => fileInputRef.current.click()}
			>
				<Avatar
					src={profile.avatar}
					title={"Clique para alterar a foto"}
					sx={{
						width: 96,
						height: 96,
					}}
				/>

				{/* Overlay */}
				<Box
					className="avatar-overlay"
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						borderRadius: "50%",
						backgroundColor: "rgba(0,0,0,0.5)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						opacity: 0,
						transition: "opacity 0.2s ease-in-out",
					}}
				>
					<PhotoCamera sx={{ color: "#fff" }} />
				</Box>

				<input
					ref={fileInputRef}
					type="file"
					accept="image/png, image/jpeg"
					hidden
					onChange={handleAvatarChange}
				/>
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				mb={3}
			>
				<Typography variant="subtitle1" gutterBottom>
					{profile.name}
				</Typography>

				<Typography variant="body2" color="textSecondary" mb={1}>
					{profile.email}
				</Typography>
			</Box>
		</Box>
	);
}
